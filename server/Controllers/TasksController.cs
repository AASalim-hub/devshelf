using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using server.Data;
using server.Models;
using server.DTOs.Tasks;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
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
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        var query = _context.Tasks
            .Where(t => t.UserId == userId.Value);

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status.ToLower() == status.ToLower().Trim());
        }

        var tasks = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                Project = t.Project,
                DueDate = t.DueDate,
                UserId = t.UserId,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value);

        if (task == null)
        {
            return NotFound(new { error = "Task not found" });
        }

        return Ok(new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            Project = task.Project,
            DueDate = task.DueDate,
            UserId = task.UserId,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new { error = "Title is required" });
        }

        var status = string.IsNullOrWhiteSpace(dto.Status) ? "todo" : dto.Status.Trim().ToLowerInvariant();
        var allowedStatuses = new[] { "todo", "in-progress", "done" };
        if (!allowedStatuses.Contains(status))
        {
            return BadRequest(new { error = "Invalid status. Allowed values: 'todo', 'in-progress', 'done'" });
        }

        var task = new DevTask
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            Status = status,
            Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "medium" : dto.Priority.Trim().ToLowerInvariant(),
            Project = dto.Project?.Trim(),
            DueDate = dto.DueDate,
            UserId = userId.Value,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Tasks.AddAsync(task);
        await _context.SaveChangesAsync();

        var response = new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            Project = task.Project,
            DueDate = task.DueDate,
            UserId = task.UserId,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new { error = "Title is required" });
        }

        var status = string.IsNullOrWhiteSpace(dto.Status) ? "todo" : dto.Status.Trim().ToLowerInvariant();
        var allowedStatuses = new[] { "todo", "in-progress", "done" };
        if (!allowedStatuses.Contains(status))
        {
            return BadRequest(new { error = "Invalid status. Allowed values: 'todo', 'in-progress', 'done'" });
        }

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value);

        if (task == null)
        {
            return NotFound(new { error = "Task not found" });
        }

        task.Title = dto.Title.Trim();
        task.Description = dto.Description?.Trim();
        task.Status = status;
        task.Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "medium" : dto.Priority.Trim().ToLowerInvariant();
        task.Project = dto.Project?.Trim();
        task.DueDate = dto.DueDate;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            Project = task.Project,
            DueDate = task.DueDate,
            UserId = task.UserId,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        if (string.IsNullOrWhiteSpace(dto.Status))
        {
            return BadRequest(new { error = "Status is required" });
        }

        var normalizedStatus = dto.Status.Trim().ToLowerInvariant();
        var allowedStatuses = new[] { "todo", "in-progress", "done" };
        if (!allowedStatuses.Contains(normalizedStatus))
        {
            return BadRequest(new { error = "Invalid status. Allowed values: 'todo', 'in-progress', 'done'" });
        }

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value);

        if (task == null)
        {
            return NotFound(new { error = "Task not found" });
        }

        task.Status = normalizedStatus;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            Project = task.Project,
            DueDate = task.DueDate,
            UserId = task.UserId,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "Invalid user token" });

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value);

        if (task == null)
        {
            return NotFound(new { error = "Task not found" });
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
