package board.service;

import board.domain.Comment;
import board.domain.Post;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class BoardDataStoreTest {

    private final BoardDataStore store = new BoardDataStore();

    @Test
    void findsPostById() {
        Post post = store.findPostById(1);

        assertThat(post).isNotNull();
        assertThat(post.title()).isEqualTo("공지사항");
        assertThat(post.writer().nickName()).isEqualTo("운영자");
    }

    @Test
    void returnsNullWhenPostNotFound() {
        assertThat(store.findPostById(999)).isNull();
    }

    @Test
    void findsCommentsByPostId() {
        List<Comment> comments = store.findCommentsByPostId(1);

        assertThat(comments).hasSize(1);
        assertThat(comments.get(0).content()).isEqualTo("공지사항 감사합니다.");
    }
}
