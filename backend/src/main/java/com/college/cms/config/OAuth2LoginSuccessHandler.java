package com.college.cms.config;

import com.college.cms.entity.Role;
import com.college.cms.entity.StudentProfile;
import com.college.cms.entity.User;
import com.college.cms.entity.UserStatus;
import com.college.cms.repository.StudentProfileRepository;
import com.college.cms.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String givenName = oAuth2User.getAttribute("given_name");
        String familyName = oAuth2User.getAttribute("family_name");

        if (email == null || email.isBlank()) {
            getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=GoogleAuthFailed");
            return;
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        boolean needsCompletion = false;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.getStatus() == UserStatus.INACTIVE) {
                getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=AccountInactive");
                return;
            }
            if (user.getRole() == Role.STUDENT) {
                StudentProfile sp = user.getStudentProfile();
                if (Boolean.FALSE.equals(user.getProfileCompleted()) || sp == null || sp.getDepartment() == null || sp.getDepartment().isBlank() || sp.getRollNo() == null || sp.getRollNo().startsWith("PENDING-")) {
                    needsCompletion = true;
                }
            }
        } else {
            // New user via Google OAuth2: automatically create as STUDENT with profileCompleted = false
            user = new User(email, passwordEncoder.encode(UUID.randomUUID().toString()), Role.STUDENT, UserStatus.ACTIVE);
            user.setCreatedAt(LocalDateTime.now());
            user.setProfileCompleted(false);
            user = userRepository.save(user);

            String pendingRollNo = "PENDING-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            StudentProfile sp = new StudentProfile(
                user,
                pendingRollNo,
                givenName != null ? givenName : "Student",
                familyName != null ? familyName : "User",
                "",
                1,
                ""
            );
            studentProfileRepository.save(sp);
            user.setStudentProfile(sp);
            needsCompletion = true;
        }

        String token = jwtUtils.generateTokenFromUsernameAndRole(user.getEmail(), user.getRole().name(), user.getId());
        String fullName = name != null && !name.isBlank() ? name : (givenName != null ? (givenName + " " + (familyName != null ? familyName : "")).trim() : "Student User");
        String encodedName = URLEncoder.encode(fullName, StandardCharsets.UTF_8);
        String encodedEmail = URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);
        String roleStr = user.getRole().name();

        String targetPath = needsCompletion ? "/complete-profile" : "/login";
        String redirectUrl = String.format("%s%s?oauth_token=%s&role=%s&email=%s&name=%s",
            frontendUrl, targetPath, token, roleStr, encodedEmail, encodedName);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
