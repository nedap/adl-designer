package org.openehr.designer.repository;

import org.eclipse.egit.github.core.RepositoryId;
import org.eclipse.egit.github.core.service.RepositoryService;
import org.eclipse.jgit.api.CloneCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.TextProgressMonitor;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.beans.factory.annotation.Required;

import java.io.File;
import java.io.IOException;

/**
 * Created by Denko on 10/28/2015.
 */
public class GitHub {
    private static String repositoriesFolder;

    public void setRepositoriesFolder(String repositoriesFolder) {
        this.repositoriesFolder = repositoriesFolder;
    }




/*    public static void forkRepo(String token) throws IOException {
        RepositoryService service = new RepositoryService();
        service.getClient().setOAuth2Token(token);

        RepositoryId toBeForked = new RepositoryId("ehrscape", "adl-models");
        service.forkRepository(toBeForked);

    }
    public static void cloneForkToLocal(String token, String username) throws IOException, GitAPIException {

        CloneCommand clone = new CloneCommand();
        clone.setProgressMonitor(new TextProgressMonitor());
        clone.setURI("https://github.com/ehrscape/adl-models.git");
        clone.setCredentialsProvider(new UsernamePasswordCredentialsProvider(token,""));
        clone.setDirectory(new File("C:/Users/Denko/Desktop/ADLDesigner/repository/templates/"+username+"/workingFiles"));
        clone.setBranch("master");
        clone.call();
    }*/
}
