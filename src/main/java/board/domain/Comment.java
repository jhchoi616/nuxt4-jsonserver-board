package board.domain;

public record Comment(
    long id,
    long postsId,
    Writer writer,
    long writerId,
    String content,
    String createdAt
) {
}
