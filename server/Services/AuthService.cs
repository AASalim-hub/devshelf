namespace server.Services;

using server.Models;
using server.DTOs.Auth;
using server.Data;
using Microsoft.EntityFrameworkCore;

public class AuthService
{
    private readonly AppDbContext _context;
    // Constructor? (might need AppDbContext)
    private readonly JwtService _jwtService;
    public AuthService(AppDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;

    }

    // Register method
    // Logic: validate input + hash password + save user + return result
    public async Task<(bool success, string message)> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.UserName))
            return (false, "Username is required");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return (false, "Email is required");

        if (string.IsNullOrWhiteSpace(dto.Password))
            return (false, "Password is required");

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        // 1. Validate input (is email already taken?)
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (existingUser != null)
        {
            return (false, "Email already taken");
        }

        // 2. Hash the plain password using BCrypt
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        // 3. Create a new User object
        var newUser = new User
        {
            Id = Guid.NewGuid(),
            UserName = dto.UserName.Trim(),
            Email = normalizedEmail,
            CreatedAt = DateTime.UtcNow
        };

        newUser.SetPasswordHash(hashedPassword);

        // 4. Save to database
        await _context.Users.AddAsync(newUser);
        await _context.SaveChangesAsync();

        // 5. Return success or failure
        return (true, "User registered successfully");
    }

    // Login method  
    // Logic: find user + verify password + return result
    public async Task<(bool success, string message, AuthResponseDto? response)> Login(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return (false, "Invalid email or password", null);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        // Step 1: Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        // Step 2: If not found, return error (don't say which field is wrong!)
        if (user == null)
        {
            return (false, "Invalid email or password", null);
        }

        // Step 3: Verify password using BCrypt
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            // Step 4: If password wrong, return error
            return (false, "Invalid email or password", null);
        }

        // Generate JWT token
        string token = _jwtService.GenerateToken(user);

        var response = new AuthResponseDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            Token = token
        };

        // Step 5: If everything ok, return success + user
        return (true, "Login successful", response);
        
        
        
    }

    

};