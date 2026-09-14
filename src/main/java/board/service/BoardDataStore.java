package board.service;

import board.domain.Comment;
import board.domain.Post;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Component
public class BoardDataStore {

    private final List<Post> posts;
    private final List<Comment> comments;

    public BoardDataStore() {
        try (InputStream dbJson = getClass().getResourceAsStream("/db.json")) {
            Db db = JsonMapper.builder().build().readValue(dbJson, Db.class);
            this.posts = db.posts();
            this.comments = db.comments();
        } catch (IOException e) {
            throw new IllegalStateException("db.json을 읽지 못했습니다", e);
        }
    }

    public Post findPostById(long id) {
        return posts.stream()
            .filter(post -> post.id() == id)
            .findFirst()
            .orElse(null);
    }

    public List<Comment> findCommentsByPostId(long id) {
        return comments.stream()
            .filter(comment -> comment.postsId() == id)
            .toList();
    }

    private record Db(List<Post> posts, List<Comment> comments) {
    }
}
