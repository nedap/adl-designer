package org.openehr.designer.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpSession;

/**
 * Created by Denko on 10/27/2015.
 */
@RequestMapping(value = "")
@Controller
public class UserResourceImpl implements UserResource {
    @RequestMapping(method = RequestMethod.GET, value = "/template-editor")
    @Override
    public ModelAndView displayTemplateEditor(HttpSession session) {
        ModelAndView result = new ModelAndView("template-editor");

        return result;
    }
}
