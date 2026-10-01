namespace server.Models;

public class Resource
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Url { get; set; }
    public string? Notes { get; set; }
    public string Type { get; set; } = "article"; // article, video, tool, docs, other
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
