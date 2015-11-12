/*
 * ADL Designer
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

package org.openehr.designer.repository.github;

import com.google.common.base.Charsets;
import com.google.common.collect.Iterables;
import org.apache.commons.codec.binary.Base64;
import org.eclipse.egit.github.core.Repository;
import org.eclipse.egit.github.core.RepositoryBranch;
import org.eclipse.egit.github.core.RepositoryContents;
import org.eclipse.egit.github.core.client.GitHubClient;
import org.eclipse.egit.github.core.client.RequestException;
import org.openehr.designer.repository.AbstractRepository;
import org.openehr.designer.repository.github.egitext.PushContentsService;
import org.openehr.designer.repository.github.egitext.PushRepositoryService;
import sun.misc.BASE64Decoder;

import java.io.IOException;
import java.util.List;

/**
 * @author markopi
 */
public class AbstractGithubRepository extends AbstractRepository {

    protected String branch;
    protected GitHubClient github;
    protected PushContentsService githubContentsService;
    protected PushRepositoryService githubRepositoryService;

    protected Repository githubRepository;

    protected void init(String branch, String accessToken, String repo) throws IOException {
        this.branch = branch;
        github = new GitHubClient();
        github.setCredentials(branch, accessToken);
        githubRepositoryService = new PushRepositoryService(github);

        githubContentsService = new PushContentsService(github);
        String[] repos = repo.split("/");
        String repoOwner = repos[0];
        String repoName = repos[1];
        this.githubRepository = githubRepositoryService.getRepository(repoOwner, repoName);
    }

    protected void createBranchIfNeeded(String branch) {
        try {
            List<RepositoryBranch> branches = githubRepositoryService.getBranches(githubRepository);
            RepositoryBranch repoBranch = branches.stream().filter(b -> b.getName().equals(branch)).findFirst().orElse(null);
            if (repoBranch == null) {
                RepositoryBranch masterBranch = branches.stream()
                        .filter(b -> b.getName().equals(githubRepository.getMasterBranch()))
                        .findFirst().get();
                githubRepositoryService.createBranch(githubRepository, branch, masterBranch.getCommit().getSha());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    protected RepositoryContents getFileContentsOrNull(String path) {
        try {
            return Iterables.getOnlyElement(githubContentsService.getContents(githubRepository, path, branch));
        } catch (RequestException e) {
            if (e.getStatus() == 404) {
                return null;
            }
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected String decodeBase64(String content) {
        BASE64Decoder decoder = new BASE64Decoder();
        byte[] decodedBytes;
        try {
            decodedBytes = decoder.decodeBuffer(content);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return new String(decodedBytes);
    }

    protected String encodeBase64(byte[] bytes) {
        return Base64.encodeBase64String(bytes).replaceAll("\\r|\\n", "");
    }

    protected String encodeBase64(String string) {
        return encodeBase64(string.getBytes(Charsets.UTF_8));
    }


}
