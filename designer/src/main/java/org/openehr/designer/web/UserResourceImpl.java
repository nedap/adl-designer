package org.openehr.designer.web;


import com.google.gson.Gson;
import org.eclipse.egit.github.core.User;
import org.eclipse.egit.github.core.client.GitHubClient;
import org.eclipse.egit.github.core.service.UserService;
import org.openehr.designer.Configuration;
import org.openehr.designer.repository.github.GithubArchetypeRepository;
import org.openehr.designer.repository.github.egitext.GetAccessTokenRequest;
import org.openehr.designer.repository.github.egitext.GetAccessTokenResponse;
import org.openehr.designer.repository.github.egitext.GitOauthService;
import org.openehr.designer.user.UserConfigurationService;
import org.openehr.designer.user.UserRepositoriesConfiguration;
import org.openehr.designer.user.UserRepositoryConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * Created by Denko on 10/27/2015.
 */
@RequestMapping(value = "")
@Controller
public class UserResourceImpl implements UserResource {
    private static final Logger LOG = LoggerFactory.getLogger(UserResourceImpl.class);

    private Gson gson = new Gson();

    @Resource
    private GithubRepositoryProvider githubRepositoryProvider;
    @Resource
    private UserConfigurationService userConfigurationService;

    @RequestMapping(method = RequestMethod.GET, value = "/template-editor")
    public ModelAndView displayTemplateEditor(HttpSession session) {
        SessionContext ctx = WebAttributes.getSessionConfiguration(session);

        if (ctx == null || ctx.getGithubRepository() == null) {
            ModelAndView result = new ModelAndView("Login");
            return result;
        }

        ModelAndView result = new ModelAndView("template-editor");
        result.addObject("Repositories", userConfigurationService.getRepositories(ctx.getUsername()).getRepositories());
        result.addObject("CurrentRepo", ctx.getGithubRepository());
        return result;
    }

    @RequestMapping(method = RequestMethod.GET, value = "/RepositoryProvider")
    public ModelAndView displayTest(HttpServletRequest req, @RequestParam String repo) throws Exception {
        SessionContext ctx = WebAttributes.getSessionConfiguration(req.getSession());
        ctx.setGithubRepository(repo);

        // trigger repository init if needed
        githubRepositoryProvider.getArchetypeRepositoryForUser(ctx);
        githubRepositoryProvider.getTemplateRepositoryForUser(ctx);

        return new ModelAndView("redirect:/template-editor");

    }

    @RequestMapping(method = RequestMethod.GET, value = "/AddRepository")
    public ResponseEntity<String> RepoAdder(HttpServletRequest req, @RequestParam String value) throws Exception {
        SessionContext ctx = WebAttributes.getSessionConfiguration(req.getSession());

        UserRepositoriesConfiguration repositories = userConfigurationService.getRepositories(ctx.getUsername());
        if (repositories.findByName(value).isPresent()) {
            return new ResponseEntity<>("Repository already in repository list", HttpStatus.BAD_REQUEST);
        }

        // tries to initialize the added repository as a way of validation
        githubRepositoryProvider.getTemplateRepositoryForUser(ctx, value);
        GithubArchetypeRepository archetypeRepository = (GithubArchetypeRepository)
                githubRepositoryProvider.getArchetypeRepositoryForUser(ctx, value);

        UserRepositoryConfiguration repo = new UserRepositoryConfiguration();
        repo.setName(value);
        repo.setFork(archetypeRepository.isFork());
        userConfigurationService.saveRepository(ctx.getUsername(), repo);

        return new ResponseEntity<>("Repository added successfully!", HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/RepositoryChooser")
    public ModelAndView repoChooser(HttpServletRequest req, @RequestParam String code) throws Exception {
        SessionContext ctx = new SessionContext();

        if (ctx.getGithubToken() == null) {
            if (code != null) {
                GitOauthService gos = new GitOauthService();
                GetAccessTokenResponse gatr = gos.getAccessToken(new GetAccessTokenRequest(
                        Configuration.get("github.api.auth.client_id"),
                        Configuration.get("github.api.auth.secret"),
                        code
                ));
                ctx.setGithubToken(gatr.getAccessToken());
            }
        }

        GitHubClient github = new GitHubClient();
        github.setOAuth2Token(ctx.getGithubToken());
        UserService userService = new UserService(github);
        User user = userService.getUser();
        ctx.setUsername(user.getLogin());

        List<UserRepositoryConfiguration> repositories = userConfigurationService.getRepositories(ctx.getUsername()).getRepositories();


        ModelAndView view = new ModelAndView("RepositoryChooser");
        req.getSession().setAttribute(WebAttributes.SESSION_CONTEXT, ctx);
        view.addObject("Repositories", repositories);
        return view;
    }

    @RequestMapping(method = RequestMethod.GET, value = "/Logout")
    public ModelAndView Logout(HttpServletRequest req) {
        ModelAndView view = new ModelAndView("Login");
        req.getSession().invalidate();
        return view;
    }


}
