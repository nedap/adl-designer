package org.openehr.designer.web;


import org.eclipse.egit.github.core.client.GitHubClient;
import org.eclipse.egit.github.core.service.GitHubService;
import org.eclipse.egit.github.core.service.RepositoryService;
import org.eclipse.jgit.api.*;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.internal.storage.file.FileRepository;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.lib.StoredConfig;
import org.eclipse.jgit.merge.MergeStrategy;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.transport.CredentialItem;
import org.eclipse.jgit.transport.FetchResult;
import org.eclipse.jgit.transport.RefSpec;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.json.JSONObject;

import org.openehr.designer.repository.GitHub;
import org.openehr.designer.repository.TemplateRepository;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.ModelAndView;
import org.json.simple.parser.JSONParser;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.FileReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;


/**
 * Created by Denko on 10/27/2015.
 */
@RequestMapping(value = "")
@Controller
public class UserResourceImpl implements UserResource {

    //Map<String, String> activeUsers = new HashMap<String, String>();


    @RequestMapping(method = RequestMethod.GET, value = "/template-editor")

    public ModelAndView displayTemplateEditor(HttpServletRequest req, HttpServletResponse res) {

        HttpSession session = req.getSession();
        if(session.getAttribute("Token")==null){
            ModelAndView result = new ModelAndView("Login");
            return result;
        }

        ModelAndView result = new ModelAndView("template-editor");
        return result;
    }

    @RequestMapping(method = RequestMethod.GET, value = "/GithubCallback")
    public ModelAndView displayTest(HttpServletRequest req){
        HttpSession session = req.getSession();
        String githubCode = req.getParameter("code");
        String tokenResult, username;
        JSONObject objx;
        if(req.getSession().getAttribute("Token")==null){
            if(githubCode != null){
                RestTemplate restTemplate = new RestTemplate();
                MultiValueMap<String, String> map = new LinkedMultiValueMap<String, String>();
                map.add("client_id", "d0b3c06d13fdfabf0c88");
                map.add("client_secret", "3d9bece886ab0dc46202260248596421c1ce6712");
                map.add("code", githubCode);
                tokenResult = restTemplate.postForObject("https://github.com/login/oauth/access_token/", map, String.class);
                int a = tokenResult.indexOf("=");
                int b = tokenResult.indexOf("&scope");
                String token = tokenResult.substring(a+1,b);
                String res = restTemplate.getForObject("https://api.github.com/user?access_token="+token, String.class);
                //String username = res.substring(res.indexOf("login")+8,res.indexOf("id")-3);


                try{
                    objx = new JSONObject(res);
                    username = objx.getString("login");
                }
                catch(Exception e){
                    throw new RuntimeException(e);
                }
                //try{GitHub.cloneForkToLocal(token, username);}catch(Exception e){};
                try{

                    Git git = Git.init().setDirectory(new File(TemplateRepositoryProvider.baseRepositoryLocation + "/" + username + "h")).call();
                    //git.checkout().setCreateBranch(true).setName("temp").call();
                    StoredConfig config = git.getRepository().getConfig();
                    config.setString("remote", "origin", "url", "https://github.com/ehrscape/adl-models.git");
                    config.save();
                    File myfile = new File(git.getRepository().getDirectory().getParent(), "tester.txt");
                    myfile.createNewFile();
                    // run the add-call
                    // test1
                    git.add()
                            .addFilepattern("tester.txt")
                            .call();
                    git.commit().setMessage("Config file added by system").call();

                    FetchCommand cmd = git.fetch();
                    cmd.setRefSpecs(new RefSpec("refs/heads/master:refs/heads/update")).setCredentialsProvider(new UsernamePasswordCredentialsProvider(token, ""));

                    FetchResult fetchRes = cmd.call();
                    List<Ref> branches = git.branchList().call();
                    git.checkout().setName("newbranch").call();
                    String q = "Q";
                    /*Ref ref = git.checkout().setCreateBranch(true).setN
                    ame("temp1").setUpstreamMode(CreateBranchCommand.SetupUpstreamMode.SET_UPSTREAM)
                            .setStartPoint("master").call();*/

                    /*MergeCommand mergeCmd = git.merge();
                    mergeCmd.include(git.getRepository().getRef("denkomanceskihehe"))
                            .setStrategy(MergeStrategy.OURS)
                            .setMessage("Merged with ours")
                            .call();*/


                }catch(Exception e){
                    throw new RuntimeException(e);
                }





                if(session.getAttribute("Token")!=null){
                    //user was already logged
                }
                else{
                    session.setAttribute("Token", token);
                    session.setAttribute("Username", username);
                }
            }
        }
        return new ModelAndView("redirect:/template-editor");

    }
    @RequestMapping(method = RequestMethod.GET, value = "/Logout")
    public ModelAndView Logout(HttpServletRequest req){
        ModelAndView view = new ModelAndView("Login");
        HttpSession session = req.getSession();
        session.invalidate();
        return view;
    }
}
