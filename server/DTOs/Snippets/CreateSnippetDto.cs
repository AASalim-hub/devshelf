namespace server.DTOs.Snippets;

public class CreateSnippetDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Code { get; set; }
    public string Language { get; set; } = "plaintext";
    public string? Tags { get; set; }
}
