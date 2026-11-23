package com.college.cms.controller;

import com.college.cms.dto.*;
import com.college.cms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${google.client.id:YOUR_GOOGLE_CLIENT_ID}")
    private String googleClientId;

    @GetMapping("/oauth-config")
    public ResponseEntity<Map<String, Object>> getOAuthConfig() {
        boolean googleEnabled = googleClientId != null
            && !googleClientId.isBlank()
            && !"YOUR_GOOGLE_CLIENT_ID".equalsIgnoreCase(googleClientId.trim());
        return ResponseEntity.ok(Map.of("googleEnabled", googleEnabled));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<AuthResponse> completeProfile(@Valid @RequestBody CompleteProfileRequest request,
                                                        Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new com.college.cms.exception.BadRequestException("Authentication required to complete profile.");
        }
        return ResponseEntity.ok(authService.completeProfile(authentication.getName(), request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "If this email exists, a reset link has been sent."));
    }

    @GetMapping("/reset-password/validate")
    public ResponseEntity<Map<String, Object>> validateResetToken(@RequestParam String token) {
        boolean valid = authService.validateResetToken(token);
        return ResponseEntity.ok(Map.of("valid", valid, "message", "Token is valid"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successful. Please login."));
    }
}
