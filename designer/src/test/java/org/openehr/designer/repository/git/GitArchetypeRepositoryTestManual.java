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

package org.openehr.designer.repository.git;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.openehr.designer.repository.ScmEnabled;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.List;

public class GitArchetypeRepositoryTestManual {
    GitArchetypeRepository repository;

    @BeforeClass
    public void init() throws IOException, GitAPIException {
        repository = new GitArchetypeRepository();
        repository.setGitRepoFolder("c:/projects/thinkehr/adltools-sandbox");
        repository.init();
    }



    @Test
    public void testDiff() throws Exception {

        List<ScmEnabled.DiffItem> items = repository.status();
        for (ScmEnabled.DiffItem item : items) {
            System.out.println(item);
        }
    }
}