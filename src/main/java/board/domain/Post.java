package board.domain;

public record Post(
    long id,
    String title,
    int type,
    String content,
    int viewCount,
    Writer writer,
    long writerId,
    String createdAt
) {
}
