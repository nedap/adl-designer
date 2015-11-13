package org.openehr.designer.web;

import com.google.common.collect.Maps;
import org.openehr.designer.repository.ArchetypeRepository;
import org.openehr.designer.repository.TemplateRepository;
import org.openehr.designer.repository.github.GithubArchetypeRepository;
import org.openehr.designer.repository.github.GithubTemplateRepository;

import java.util.Map;
import java.util.Objects;

/**
 * Created by Denko on 10/28/2015.
 */
public class GithubRepositoryProvider {
    public static Map<RepoKey, GithubTemplateRepository> userToTemplateRepositoryMap = Maps.newConcurrentMap();
    public static Map<RepoKey, GithubArchetypeRepository> userToArchetypeRepositoryMap = Maps.newConcurrentMap();


    public TemplateRepository getTemplateRepository(SessionContext conf) {
        return getTemplateRepository(conf, conf.getGithubRepository());
    }

    public ArchetypeRepository getArchetypeRepository(SessionContext conf) {
        return getArchetypeRepository(conf, conf.getGithubRepository());
    }

    public TemplateRepository getTemplateRepository(SessionContext conf, String repositoryName) {
        return userToTemplateRepositoryMap.computeIfAbsent(new RepoKey(conf.getUsername(), repositoryName), (u) -> {
            GithubTemplateRepository r = new GithubTemplateRepository();
            r.init(conf.getUsername(), conf.getGithubToken(), repositoryName);
            return r;
        });
    }

    public ArchetypeRepository getArchetypeRepository(SessionContext conf, String repositoryName) {

        return userToArchetypeRepositoryMap.computeIfAbsent(new RepoKey(conf.getUsername(), repositoryName), (u) -> {
            GithubArchetypeRepository r = new GithubArchetypeRepository();
            r.init(conf.getUsername(), conf.getGithubToken(), repositoryName);
            return r;
        });
    }

    private static final class RepoKey {
        final String username;
        final String repositoryName;

        RepoKey(String username, String repositoryName) {
            this.username = username;
            this.repositoryName = repositoryName;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            RepoKey key = (RepoKey) o;
            return Objects.equals(username, key.username) &&
                    Objects.equals(repositoryName, key.repositoryName);
        }

        static RepoKey from(SessionContext ctx) {
            return new RepoKey(ctx.getUsername(), ctx.getGithubRepository());
        }

        @Override
        public int hashCode() {
            return Objects.hash(username, repositoryName);
        }
    }
}
