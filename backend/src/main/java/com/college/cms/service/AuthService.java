package com.college.cms.service;

import com.college.cms.dto.*;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    boolean validateResetToken(String token);
    void resetPassword(ResetPasswordRequest request);
    UserProfileResponse getCurrentUserProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
    AuthResponse completeProfile(String email, CompleteProfileRequest request);
    void changePassword(String email, String oldPassword, String newPassword);
}
