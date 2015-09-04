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

package org.openehr.designer.repository.git;

import org.eclipse.jgit.api.*;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.diff.DiffEntry;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.errors.IncorrectObjectTypeException;
import org.eclipse.jgit.errors.MissingObjectException;
import org.eclipse.jgit.lib.*;
import org.eclipse.jgit.merge.MergeStrategy;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.transport.FetchResult;
import org.eclipse.jgit.treewalk.AbstractTreeIterator;
import org.eclipse.jgit.treewalk.CanonicalTreeParser;
import org.openehr.designer.repository.AbstractFileBasedArchetypeRepository;
import org.openehr.designer.repository.ArchetypeRepositoryScmException;
import org.openehr.designer.repository.ScmEnabled;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.util.FileSystemUtils;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static com.google.common.base.MoreObjects.firstNonNull;

/**
 * @author markopi
 */
public class GitArchetypeRepository extends AbstractFileBasedArchetypeRepository implements ScmEnabled {
    public static final Logger LOG = LoggerFactory.getLogger(GitArchetypeRepository.class);

    private String gitUrl;
    private String gitRepoFolder;
    private Git git;

    private AbstractTreeIterator prepareTreeParser(ObjectId objectId) throws IOException,
            MissingObjectException,
            IncorrectObjectTypeException {
        // from the commit we can build the tree which allows us to construct the TreeParser
        RevWalk walk = new RevWalk(git.getRepository());
        RevCommit commit = walk.parseCommit(objectId);
        RevTree tree = walk.parseTree(commit.getTree().getId());

        CanonicalTreeParser oldTreeParser = new CanonicalTreeParser();
        ObjectReader oldReader = git.getRepository().newObjectReader();
        try {
            oldTreeParser.reset(oldReader, tree.getId());
        } finally {
            oldReader.release();
        }

        walk.dispose();

        return oldTreeParser;
    }

    @Required
    public void setGitUrl(String gitUrl) {
        this.gitUrl = gitUrl;
    }

    @Required
    public void setGitRepoFolder(String gitRepoFolder) {
        this.gitRepoFolder = gitRepoFolder;
    }

    @PostConstruct
    public void init() throws IOException, GitAPIException {
        File repoFolderFile = new File(gitRepoFolder);

        if (!repoFolderFile.exists()) {
            try {
                LOG.info("Local git folder not found, cloning from remote");
                // clone from remote git
                CloneCommand clone = new CloneCommand();
                clone.setProgressMonitor(new TextProgressMonitor());
                clone.setURI(gitUrl);
                clone.setDirectory(new File(gitRepoFolder));
                clone.setBranch("master");
                git = clone.call();
            } catch (GitAPIException e) {
                FileSystemUtils.deleteRecursively(repoFolderFile);
                throw e;
            }
        } else {
            LOG.info("Local git folder found, pulling from remote");
            FileRepositoryBuilder builder = new FileRepositoryBuilder();
            Repository repository = builder.setWorkTree(repoFolderFile)
                    .readEnvironment()
                    .build();
            git = new Git(repository);
            update();
        }
        parseRepository();

    }

    @Override
    public void update() {
        try {
//            PullResult pull = git.pull()
//                    .setProgressMonitor(new TextProgressMonitor())
//                    .setStrategy(MergeStrategy.OURS)
//                    .call();
            FetchResult fetch = git.fetch().call();


            LOG.debug("PULL fetch: {}", fetch.getTrackingRefUpdates());


            MergeResult merge = git.merge()
                    .include(git.getRepository().getRef("origin/master"))
                    .setStrategy(MergeStrategy.OURS)
                    .setMessage("Merged with ours")
                    .call();

            LOG.debug("MERGE status: {}", merge.getMergeStatus());

            LOG.debug("New repository status: " + git.getRepository().getRepositoryState());
        } catch (GitAPIException | IOException e) {
            throw new ArchetypeRepositoryScmException("Could not update from remote repository", e);
        }
    }

    @Override
    public List<DiffItem> status() {
        try {
            AbstractTreeIterator oldTreeParser = prepareTreeParser(git.getRepository().resolve(Constants.HEAD));
            List<DiffEntry> diff = git.diff().setOldTree(oldTreeParser).call();

            List<DiffItem> result = new ArrayList<>();
            for (DiffEntry entry : diff) {
                DiffItem item = new DiffItem();
                item.setPath(firstNonNull(entry.getOldPath(), entry.getNewPath()));
                item.setChangeType(convertChangeType(entry.getChangeType()));
                result.add(item);
            }
            return result;
        } catch (IOException | GitAPIException e) {
            throw new ArchetypeRepositoryScmException("Couldn't diff", e);
        }
    }

    private ChangeType convertChangeType(DiffEntry.ChangeType changeType) {
        switch (changeType) {
            case ADD:
                return ChangeType.ADD;
            case DELETE:
                return ChangeType.DELETE;
            case MODIFY:
                return ChangeType.MODIFY;
            case COPY:
                return ChangeType.ADD;
            case RENAME:
                return ChangeType.MODIFY;
            default:
                throw new AssertionError(changeType);
        }
    }

    @Override
    public void commit(String message) {
        gitCommit(message);
        gitPush();
    }

    private void gitCommit(String message) {
        try {
            git.commit()
                    .setCommitter("adltools", "adltools@marand.si")
                    .setMessage(message)
                    .setAll(true)
                    .call();
        } catch (GitAPIException e) {
            throw new ArchetypeRepositoryScmException("Could not execute git commit", e);
        }
    }

    private void gitPush() {
        try {
            git.push()
                    .call();
        } catch (GitAPIException e) {
            throw new ArchetypeRepositoryScmException("Could not execute git push", e);
        }
    }

    @PostConstruct
    public void destroy() {
        git.close();
    }

    @Override
    public DifferentialArchetype getDifferentialArchetype(String archetypeId) {
        return loadDifferentialArchetype(archetypeId);
    }

    @Override
    public void saveDifferentialArchetype(DifferentialArchetype archetype) {
        LocalArchetypeInfo localArchetypeInfo = saveArchetypeToFile(archetype);
        try {
            git.add()
                    .addFilepattern(localArchetypeInfo.getPath().toString().replaceAll("\\\\", "/"))
                    .call();
        } catch (GitAPIException e) {
            throw new ArchetypeRepositoryScmException("Could not add file to git", e);
        }
    }

    @Override
    protected Path getRepositoryLocation() {
        return Paths.get(gitRepoFolder);
    }
}
