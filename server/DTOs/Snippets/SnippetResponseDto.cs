namespace server.DTOs.Snippets;

public class SnippetResponseDto
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Code { get; set; }
    public required string Language { get; set; }
    public string? Tags { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
