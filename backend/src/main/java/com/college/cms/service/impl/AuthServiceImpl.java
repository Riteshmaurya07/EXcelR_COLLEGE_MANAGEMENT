package com.college.cms.service.impl;

import com.college.cms.config.JwtUtils;
import com.college.cms.dto.*;
import com.college.cms.entity.*;
import com.college.cms.exception.BadRequestException;
import com.college.cms.exception.DuplicateResourceException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.*;
import com.college.cms.service.AuthService;
import com.college.cms.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new BadRequestException("Your account is inactive. Please contact the administrator.");
        }

        String token = jwtUtils.generateToken(authentication);
        String fullName = getFullNameForUser(user);
        Object profileData = getProfileDataForUser(user);

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole().name(), fullName, profileData);
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        if (studentProfileRepository.existsByRollNo(request.getRollNo())) {
            throw new DuplicateResourceException("Roll number already exists: " + request.getRollNo());
        }

        // Backend strictly forces role = STUDENT
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setStatus(UserStatus.ACTIVE);
        user.setProfileCompleted(true);
        user.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        StudentProfile profile = new StudentProfile();
        profile.setUser(savedUser);
        profile.setRollNo(request.getRollNo());
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setDepartment(request.getDepartment());
        profile.setSemester(request.getSemester());
        profile.setPhone(request.getPhone());
        StudentProfile savedProfile = studentProfileRepository.save(profile);

        savedUser.setStudentProfile(savedProfile);

        String token = jwtUtils.generateTokenFromUsernameAndRole(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());
        String fullName = request.getFirstName() + " " + request.getLastName();

        Map<String, Object> profMap = new HashMap<>();
        profMap.put("rollNo", savedProfile.getRollNo());
        profMap.put("department", savedProfile.getDepartment());
        profMap.put("semester", savedProfile.getSemester());
        profMap.put("phone", savedProfile.getPhone());

        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name(), fullName, profMap);
    }

    @Override
    public AuthResponse completeProfile(String email, CompleteProfileRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("Only student profiles can be completed via this endpoint.");
        }

        if (request.getPhone() != null && !request.getPhone().trim().isBlank()) {
            String digits = request.getPhone().replaceAll("\\D", "");
            if (digits.length() < 10) {
                throw new BadRequestException("Phone number must have at least 10 digits.");
            }
        }

        String dept = request.getDepartment().trim().toUpperCase();
        String[] parts = request.getFullName().trim().split("\\s+", 2);
        String fName = parts[0];
        String lName = parts.length > 1 ? parts[1] : "";

        StudentProfile sp = user.getStudentProfile();
        if (sp == null) {
            sp = new StudentProfile();
            sp.setUser(user);
        }

        String rollNo = dept + "-2026-" + String.format("%03d", (int)(Math.random() * 900) + 100);
        while (studentProfileRepository.existsByRollNo(rollNo)) {
            rollNo = dept + "-2026-" + String.format("%03d", (int)(Math.random() * 900) + 100);
        }

        sp.setRollNo(rollNo);
        sp.setFirstName(fName);
        sp.setLastName(lName);
        sp.setDepartment(dept);
        sp.setSemester(request.getSemester());
        sp.setPhone(request.getPhone().trim());
        StudentProfile savedSp = studentProfileRepository.save(sp);

        user.setProfileCompleted(true);
        user.setStudentProfile(savedSp);
        userRepository.save(user);

        String token = jwtUtils.generateTokenFromUsernameAndRole(user.getEmail(), user.getRole().name(), user.getId());
        String fullName = (fName + " " + lName).trim();

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole().name(), fullName, getProfileDataForUser(user));
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = UUID.randomUUID().toString().replace("-", "");
            PasswordResetToken resetToken = new PasswordResetToken(user, token, LocalDateTime.now().plusMinutes(30));
            passwordResetTokenRepository.save(resetToken);
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateResetToken(String tokenStr) {
        if (tokenStr == null || tokenStr.isBlank()) {
            throw new BadRequestException("This reset link is invalid or expired. Please request a new one.");
        }
        PasswordResetToken token = passwordResetTokenRepository.findByToken(tokenStr)
            .orElseThrow(() -> new BadRequestException("This reset link is invalid or expired. Please request a new one."));

        if (Boolean.TRUE.equals(token.getUsed()) || token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset link is invalid or expired. Please request a new one.");
        }
        return true;
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new BadRequestException("This reset link is invalid or expired. Please request a new one."));

        if (Boolean.TRUE.equals(token.getUsed()) || token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset link is invalid or expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Map<String, Object> details = new HashMap<>();
        if (user.getRole() == Role.STUDENT && user.getStudentProfile() != null) {
            StudentProfile sp = user.getStudentProfile();
            details.put("rollNo", sp.getRollNo());
            details.put("firstName", sp.getFirstName());
            details.put("lastName", sp.getLastName());
            details.put("name", sp.getFirstName() + " " + sp.getLastName());
            details.put("department", sp.getDepartment());
            details.put("semester", sp.getSemester());
            details.put("phone", sp.getPhone());
        } else if (user.getRole() == Role.FACULTY && user.getFacultyProfile() != null) {
            FacultyProfile fp = user.getFacultyProfile();
            details.put("employeeId", fp.getEmployeeId());
            details.put("firstName", fp.getFirstName());
            details.put("lastName", fp.getLastName());
            details.put("name", fp.getFirstName() + " " + fp.getLastName());
            details.put("department", fp.getDepartment());
            details.put("designation", fp.getDesignation());
            details.put("phone", fp.getPhone());
        } else if (user.getRole() == Role.ADMIN) {
            String fName = user.getFirstName() != null && !user.getFirstName().isBlank() ? user.getFirstName() : "Sunrise";
            String lName = user.getLastName() != null && !user.getLastName().isBlank() ? user.getLastName() : "Admin";
            String phone = user.getPhone() != null && !user.getPhone().isBlank() ? user.getPhone() : "+91 9876543200";
            details.put("firstName", fName);
            details.put("lastName", lName);
            details.put("name", (fName + " " + lName).trim());
            details.put("department", "Administration");
            details.put("phone", phone);
        }

        return new UserProfileResponse(user.getId(), user.getEmail(), user.getRole().name(), user.getStatus().name(), details);
    }

    @Override
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (request.getFirstName() == null || request.getFirstName().trim().isBlank()) {
            throw new BadRequestException("First name cannot be blank.");
        }
        if (request.getLastName() == null || request.getLastName().trim().isBlank()) {
            throw new BadRequestException("Last name cannot be blank.");
        }
        if (request.getPhone() != null && !request.getPhone().trim().isBlank()) {
            String digits = request.getPhone().replaceAll("\\D", "");
            if (digits.length() < 10) {
                throw new BadRequestException("Phone number must have at least 10 digits.");
            }
        }

        if (user.getRole() == Role.STUDENT) {
            StudentProfile sp = user.getStudentProfile();
            if (sp == null) {
                throw new BadRequestException("Student profile not found.");
            }
            sp.setFirstName(request.getFirstName().trim());
            sp.setLastName(request.getLastName().trim());
            if (request.getPhone() != null) {
                sp.setPhone(request.getPhone().trim());
            }
            studentProfileRepository.save(sp);
        } else if (user.getRole() == Role.FACULTY) {
            FacultyProfile fp = user.getFacultyProfile();
            if (fp == null) {
                throw new BadRequestException("Faculty profile not found.");
            }
            fp.setFirstName(request.getFirstName().trim());
            fp.setLastName(request.getLastName().trim());
            if (request.getPhone() != null) {
                fp.setPhone(request.getPhone().trim());
            }
            if (request.getDesignation() != null && !request.getDesignation().trim().isBlank()) {
                fp.setDesignation(request.getDesignation().trim());
            }
            facultyProfileRepository.save(fp);
        } else if (user.getRole() == Role.ADMIN) {
            user.setFirstName(request.getFirstName().trim());
            user.setLastName(request.getLastName().trim());
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone().trim());
            }
            userRepository.save(user);
        }

        return getCurrentUserProfile(email);
    }

    @Override
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Incorrect current password.");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private String getFullNameForUser(User user) {
        if (user.getStudentProfile() != null) {
            return user.getStudentProfile().getFirstName() + " " + user.getStudentProfile().getLastName();
        } else if (user.getFacultyProfile() != null) {
            return user.getFacultyProfile().getFirstName() + " " + user.getFacultyProfile().getLastName();
        } else {
            String fName = user.getFirstName() != null && !user.getFirstName().isBlank() ? user.getFirstName() : "Sunrise";
            String lName = user.getLastName() != null && !user.getLastName().isBlank() ? user.getLastName() : "Admin";
            return (fName + " " + lName).trim();
        }
    }

    private Object getProfileDataForUser(User user) {
        Map<String, Object> map = new HashMap<>();
        if (user.getStudentProfile() != null) {
            StudentProfile sp = user.getStudentProfile();
            map.put("rollNo", sp.getRollNo());
            map.put("department", sp.getDepartment());
            map.put("semester", sp.getSemester());
            map.put("phone", sp.getPhone());
            map.put("firstName", sp.getFirstName());
            map.put("lastName", sp.getLastName());
        } else if (user.getFacultyProfile() != null) {
            FacultyProfile fp = user.getFacultyProfile();
            map.put("employeeId", fp.getEmployeeId());
            map.put("department", fp.getDepartment());
            map.put("designation", fp.getDesignation());
            map.put("phone", fp.getPhone());
            map.put("firstName", fp.getFirstName());
            map.put("lastName", fp.getLastName());
        } else if (user.getRole() == Role.ADMIN) {
            String fName = user.getFirstName() != null && !user.getFirstName().isBlank() ? user.getFirstName() : "Sunrise";
            String lName = user.getLastName() != null && !user.getLastName().isBlank() ? user.getLastName() : "Admin";
            String phone = user.getPhone() != null && !user.getPhone().isBlank() ? user.getPhone() : "+91 9876543200";
            map.put("firstName", fName);
            map.put("lastName", lName);
            map.put("phone", phone);
            map.put("department", "Administration");
        }
        return map;
    }
}
