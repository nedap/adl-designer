package org.openehr.designer.web;

import com.google.common.collect.Maps;
import org.openehr.designer.repository.ArchetypeRepository;
import org.openehr.designer.repository.TemplateRepository;
import org.openehr.designer.repository.github.GithubArchetypeRepository;
import org.openehr.designer.repository.github.GithubTemplateRepository;

import javax.servlet.http.HttpSession;
import java.util.Map;

/**
 * Created by Denko on 10/28/2015.
 */
public class RepositoryProvider {
    public static Map<String, GithubTemplateRepository> userToTemplateRepositoryMap = Maps.newConcurrentMap();
    public static Map<String, GithubArchetypeRepository> userToArchetypeRepositoryMap = Maps.newConcurrentMap();


    public TemplateRepository getTemplateRepositoryForUser(HttpSession session) {
        String username = session.getAttribute("Username").toString();
        String token = session.getAttribute("Token").toString();
        String repo = session.getAttribute("Repo").toString();

        /*FileTemplateRepository repository = userToTemplateRepositoryMap.get(username);
        if (repository==null) {
            try {
                repository = new FileTemplateRepository();
                repository.setRepositoryLocation(Paths.get(baseRepositoryLocation).resolve(username).toString());
                repository.init();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            userToTemplateRepositoryMap.put(username, repository);
        }
        return repository;*/
        GithubTemplateRepository repository = userToTemplateRepositoryMap.get(username);
        if (repository==null) {
            try {
                repository = new GithubTemplateRepository();
                repository.init(username, token, repo);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            userToTemplateRepositoryMap.put(username, repository);
        }
        return repository;
    }
    public ArchetypeRepository getArchetypeRepositoryForUser(HttpSession session) {
        String username = session.getAttribute("Username").toString();
        String token = session.getAttribute("Token").toString();
        String repo = session.getAttribute("Repo").toString();

        GithubArchetypeRepository repository = userToArchetypeRepositoryMap.get(username);

        if (repository==null) {
            try {
                repository = new GithubArchetypeRepository();
                repository.init(username, token, repo);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            userToArchetypeRepositoryMap.put(username, repository);
        }
        return repository;
    }
}
