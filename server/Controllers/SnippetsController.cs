using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using server.Data;
using server.Models;
using server.DTOs.Snippets;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SnippetsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SnippetsController(AppDbContext context)
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

        var snippets = await _context.Snippets
            .Where(s => s.UserId == userId.Value)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SnippetResponseDto
            {
                Id = s.Id,
                Title = s.Title,
                Description = s.Description,
                Code = s.Code,
                Language = s.Language,
                Tags = s.Tags,
                UserId = s.UserId,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync();

        return Ok(snippets);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        var snippet = await _context.Snippets
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId.Value);

        if (snippet == null)
        {
            return NotFound(new { error = "Snippet not found" });
        }

        return Ok(new SnippetResponseDto
        {
            Id = snippet.Id,
            Title = snippet.Title,
            Description = snippet.Description,
            Code = snippet.Code,
            Language = snippet.Language,
            Tags = snippet.Tags,
            UserId = snippet.UserId,
            CreatedAt = snippet.CreatedAt,
            UpdatedAt = snippet.UpdatedAt
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSnippetDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new { error = "Title is required" });
        }

        if (string.IsNullOrWhiteSpace(dto.Code))
        {
            return BadRequest(new { error = "Code is required" });
        }

        var snippet = new Snippet
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            Code = dto.Code,
            Language = string.IsNullOrWhiteSpace(dto.Language) ? "plaintext" : dto.Language.Trim(),
            Tags = dto.Tags?.Trim(),
            UserId = userId.Value,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Snippets.AddAsync(snippet);
        await _context.SaveChangesAsync();

        var response = new SnippetResponseDto
        {
            Id = snippet.Id,
            Title = snippet.Title,
            Description = snippet.Description,
            Code = snippet.Code,
            Language = snippet.Language,
            Tags = snippet.Tags,
            UserId = snippet.UserId,
            CreatedAt = snippet.CreatedAt,
            UpdatedAt = snippet.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = snippet.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSnippetDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new { error = "Title is required" });
        }

        if (string.IsNullOrWhiteSpace(dto.Code))
        {
            return BadRequest(new { error = "Code is required" });
        }

        var snippet = await _context.Snippets
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId.Value);

        if (snippet == null)
        {
            return NotFound(new { error = "Snippet not found" });
        }

        snippet.Title = dto.Title.Trim();
        snippet.Description = dto.Description?.Trim();
        snippet.Code = dto.Code;
        snippet.Language = string.IsNullOrWhiteSpace(dto.Language) ? "plaintext" : dto.Language.Trim();
        snippet.Tags = dto.Tags?.Trim();
        snippet.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new SnippetResponseDto
        {
            Id = snippet.Id,
            Title = snippet.Title,
            Description = snippet.Description,
            Code = snippet.Code,
            Language = snippet.Language,
            Tags = snippet.Tags,
            UserId = snippet.UserId,
            CreatedAt = snippet.CreatedAt,
            UpdatedAt = snippet.UpdatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        var snippet = await _context.Snippets
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId.Value);

        if (snippet == null)
        {
            return NotFound(new { error = "Snippet not found" });
        }

        _context.Snippets.Remove(snippet);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
