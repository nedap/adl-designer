package org.openehr.designer.web;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.openehr.designer.repository.ArchetypeRepository;
import org.openehr.designer.repository.TemplateRepository;
import org.openehr.designer.repository.github.GithubArchetypeRepository;
import org.openehr.designer.repository.github.GithubTemplateRepository;

import java.util.Objects;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

/**
 * Created by Denko on 10/28/2015.
 */
public class RepositoryProvider {
    public static Cache<RepoKey, GithubTemplateRepository> userToTemplateRepositoryMap =
            CacheBuilder.<RepoKey, GithubTemplateRepository>newBuilder()
                    .expireAfterAccess(1, TimeUnit.DAYS)
                    .build();
    public static Cache<RepoKey, GithubArchetypeRepository> userToArchetypeRepositoryMap =
            CacheBuilder.<RepoKey, GithubArchetypeRepository>newBuilder()
                    .expireAfterAccess(1, TimeUnit.DAYS)
                    .build();


    public TemplateRepository getTemplateRepository(SessionContext conf) {
        return getTemplateRepository(conf, conf.getGithubRepository());
    }

    public ArchetypeRepository getArchetypeRepository(SessionContext conf) {
        return getArchetypeRepository(conf, conf.getGithubRepository());
    }

    private <K, V> V computeIfAbsent(Cache<K, V> cache, K key, Callable<V> supplier) {
        try {
            return cache.get(key, supplier);
        } catch (ExecutionException e) {
            if (e.getCause() instanceof RuntimeException) {
                throw (RuntimeException) e.getCause();
            }
            throw new RuntimeException(e);
        }

    }

    public TemplateRepository getTemplateRepository(SessionContext conf, String repositoryName) {
        return computeIfAbsent(userToTemplateRepositoryMap, new RepoKey(conf.getUsername(), repositoryName), () -> {
            GithubTemplateRepository r = new GithubTemplateRepository();
            r.init(conf.getUsername(), conf.getGithubToken(), repositoryName);
            return r;
        });
    }

    public ArchetypeRepository getArchetypeRepository(SessionContext conf, String repositoryName) {

        return computeIfAbsent(userToArchetypeRepositoryMap, new RepoKey(conf.getUsername(), repositoryName), () -> {
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
