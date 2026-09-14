package board;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class BoardController {

    private final BoardDataStore dataStore;

    public BoardController(BoardDataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping("/")
    public String list() {
        return "list";
    }

    @GetMapping("/posts/{id}")
    public String detail(@PathVariable long id, Model model) {
        model.addAttribute("post", dataStore.findPostById(id));
        model.addAttribute("comments", dataStore.findCommentsByPostId(id));
        return "detail";
    }

    @GetMapping("/posts/{id}/edit")
    public String edit() {
        return "form";
    }

    @GetMapping("/write")
    public String write() {
        return "form";
    }
}
