namespace server.DTOs.Resources;

public class ResourceResponseDto
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Url { get; set; }
    public string? Notes { get; set; }
    public required string Type { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
