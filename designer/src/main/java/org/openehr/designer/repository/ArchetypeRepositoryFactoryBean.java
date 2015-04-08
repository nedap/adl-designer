/*
 * ADL2-tools
 * Copyright (c) 2013-2014 Marand d.o.o. (www.marand.com)
 *
 * This file is part of ADL2-tools.
 *
 * ADL2-tools is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.openehr.designer.repository;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.openehr.designer.Configuration;
import org.openehr.designer.repository.file.FileArchetypeRepository;
import org.openehr.designer.repository.git.GitArchetypeRepository;
import org.springframework.beans.factory.FactoryBean;

import java.io.IOException;

/**
 * @author markopi
 */
public class ArchetypeRepositoryFactoryBean implements FactoryBean<ArchetypeRepository> {
    @Override
    public ArchetypeRepository getObject() throws Exception {
        String type = Configuration.get("archetype.repository.type");
        switch (type) {
            case "file": return createFileRepository();
            case "git": return createGitRepository();
            default: throw new AssertionError(type);
        }
    }

    private ArchetypeRepository createGitRepository() throws IOException, GitAPIException {
        GitArchetypeRepository repository = new GitArchetypeRepository();
        repository.setGitRepoFolder(Configuration.get("archetype.repository.git.localdir"));
        repository.setGitUrl(Configuration.get("archetype.repository.git.uri"));
        repository.setNewArchetypeFileLocationGenerator(new OpenEhrNewArchetypeFileLocationGenerator());
        repository.init();
        return repository;
    }

    private ArchetypeRepository createFileRepository() throws IOException {
        FileArchetypeRepository repository = new FileArchetypeRepository();
        repository.setRepositoryLocation(Configuration.get("archetype.repository.file.location"));
        repository.setNewArchetypeFileLocationGenerator(new OpenEhrNewArchetypeFileLocationGenerator());
        repository.init();
        return repository;
    }

    @Override
    public Class<?> getObjectType() {
        return ArchetypeRepository.class;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }
}
