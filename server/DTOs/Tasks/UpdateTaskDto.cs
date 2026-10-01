namespace server.DTOs.Tasks;

public class UpdateTaskDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = "todo";
    public string Priority { get; set; } = "medium";
    public string? Project { get; set; }
    public DateTime? DueDate { get; set; }
}
