using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using server.Data;
using server.Models;
using server.DTOs.Resources;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResourcesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ResourcesController(AppDbContext context)
    {
        _context = context;
    }

    private Guid? GetCurrentUserId()
    {
        var claimValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(claimValue, out var userId))
        {
            return userId;
        }
        return null;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        var resources = await _context.Resources
            .Where(r => r.UserId == userId.Value)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ResourceResponseDto
            {
                Id = r.Id,
                Title = r.Title,
                Url = r.Url,
                Notes = r.Notes,
                Type = r.Type,
                UserId = r.UserId,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            })
            .ToListAsync();

        return Ok(resources);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        var resource = await _context.Resources
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId.Value);

        if (resource == null)
        {
            return NotFound(new { error = "Resource not found" });
        }

        return Ok(new ResourceResponseDto
        {
            Id = resource.Id,
            Title = resource.Title,
            Url = resource.Url,
            Notes = resource.Notes,
            Type = resource.Type,
            UserId = resource.UserId,
            CreatedAt = resource.CreatedAt,
            UpdatedAt = resource.UpdatedAt
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateResourceDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new { error = "Title is required" });
        }

        if (string.IsNullOrWhiteSpace(dto.Url))
        {
            return BadRequest(new { error = "Url is required" });
        }

        var resource = new Resource
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            Url = dto.Url.Trim(),
            Notes = dto.Notes?.Trim(),
            Type = string.IsNullOrWhiteSpace(dto.Type) ? "article" : dto.Type.Trim(),
            UserId = userId.Value,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Resources.AddAsync(resource);
        await _context.SaveChangesAsync();

        var response = new ResourceResponseDto
        {
            Id = resource.Id,
            Title = resource.Title,
            Url = resource.Url,
            Notes = resource.Notes,
            Type = resource.Type,
            UserId = resource.UserId,
            CreatedAt = resource.CreatedAt,
            UpdatedAt = resource.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = resource.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateResourceDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new { error = "Title is required" });
        }

        if (string.IsNullOrWhiteSpace(dto.Url))
        {
            return BadRequest(new { error = "Url is required" });
        }

        var resource = await _context.Resources
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId.Value);

        if (resource == null)
        {
            return NotFound(new { error = "Resource not found" });
        }

        resource.Title = dto.Title.Trim();
        resource.Url = dto.Url.Trim();
        resource.Notes = dto.Notes?.Trim();
        resource.Type = string.IsNullOrWhiteSpace(dto.Type) ? "article" : dto.Type.Trim();
        resource.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new ResourceResponseDto
        {
            Id = resource.Id,
            Title = resource.Title,
            Url = resource.Url,
            Notes = resource.Notes,
            Type = resource.Type,
            UserId = resource.UserId,
            CreatedAt = resource.CreatedAt,
            UpdatedAt = resource.UpdatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        var resource = await _context.Resources
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId.Value);

        if (resource == null)
        {
            return NotFound(new { error = "Resource not found" });
        }

        _context.Resources.Remove(resource);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
