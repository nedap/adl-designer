package org.openehr.designer.web;

import com.google.common.collect.Maps;
import org.openehr.designer.repository.TemplateRepository;
import org.openehr.designer.repository.file.FileTemplateRepository;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.Map;

/**
 * Created by Denko on 10/28/2015.
 */
public class TemplateRepositoryProvider {
    private Map<String, FileTemplateRepository> userToRepositoryMap = Maps.newConcurrentMap();

    public static String baseRepositoryLocation;

    public void setBaseRepositoryLocation(String baseRepositoryLocation) {
        this.baseRepositoryLocation = baseRepositoryLocation;
    }

    public TemplateRepository getRepositoryForUser(String username) {
        FileTemplateRepository repository = userToRepositoryMap.get(username);
        if (repository==null) {
            try {
                repository = new FileTemplateRepository();
                repository.setRepositoryLocation(Paths.get(baseRepositoryLocation).resolve(username).toString());
                repository.init();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            userToRepositoryMap.put(username, repository);
        }
        return repository;
    }
}
