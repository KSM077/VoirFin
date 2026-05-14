package com.voirfin.backend.controller;

import com.voirfin.backend.model.UserModel;
import com.voirfin.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    
    @Autowired
    private UserService userService;

    @PostMapping("/sync")
    public ResponseEntity<UserModel> syncUserModel(@RequestBody UserModel user) {
        
        UserModel savedUser = userService.syncUserModel(user);
        return ResponseEntity.ok(savedUser);
    }
    

}
