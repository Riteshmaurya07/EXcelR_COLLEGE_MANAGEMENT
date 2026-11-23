package com.college.cms.controller;

import com.college.cms.dto.UpdateProfileRequest;
import com.college.cms.dto.UserProfileResponse;
import com.college.cms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getCurrentProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(authService.getCurrentUserProfile(email));
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(Authentication authentication,
                                                             @Valid @RequestBody UpdateProfileRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(authService.updateProfile(email, request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(Authentication authentication, @RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        authService.changePassword(authentication.getName(), oldPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }
}
