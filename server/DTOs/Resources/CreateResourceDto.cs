namespace server.DTOs.Resources;

public class CreateResourceDto
{
    public required string Title { get; set; }
    public required string Url { get; set; }
    public string? Notes { get; set; }
    public string Type { get; set; } = "article";
}
