package org.openehr.designer.web;

import com.google.common.collect.Maps;
import org.openehr.designer.repository.ArchetypeRepository;
import org.openehr.designer.repository.TemplateRepository;
import org.openehr.designer.repository.github.GithubArchetypeRepository;
import org.openehr.designer.repository.github.GithubTemplateRepository;

import java.util.Map;

/**
 * Created by Denko on 10/28/2015.
 */
public class RepositoryProvider {
    public static Map<String, GithubTemplateRepository> userToTemplateRepositoryMap = Maps.newConcurrentMap();
    public static Map<String, GithubArchetypeRepository> userToArchetypeRepositoryMap = Maps.newConcurrentMap();


    public TemplateRepository getTemplateRepositoryForUser(SessionContext conf) {
        return userToTemplateRepositoryMap.computeIfAbsent(conf.getUsername(), (u) -> {
            GithubTemplateRepository r = new GithubTemplateRepository();
            r.init(conf.getUsername(), conf.getGithubToken(), conf.getGithubRepository());
            return r;
        });
    }

    public ArchetypeRepository getArchetypeRepositoryForUser(SessionContext conf) {

        return userToArchetypeRepositoryMap.computeIfAbsent(conf.getUsername(), (u) -> {
            GithubArchetypeRepository r = new GithubArchetypeRepository();
            r.init(conf.getUsername(), conf.getGithubToken(), conf.getGithubRepository());
            return r;
        });
    }
}
