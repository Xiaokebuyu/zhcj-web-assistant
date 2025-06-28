import VueRouter from 'vue-router'
import HomePage from "@/pages/HomePage.vue";
import HelpForum from "@/pages/HelpForum.vue";
import AISystem from "@/pages/AISystem.vue";
import InformationFeedback from "@/pages/InformationFeedback.vue";
import PersonalCenter from "@/pages/PersonalCenter.vue";
import CreditsExchange from "@/pages/CreditsExchange.vue";
import LoginPage from "@/pages/LoginPage.vue";
import LearnCenter from "@/pages/LearnCenter.vue";
// import AssistancePlatform from "@/pages/AssistancePlatform.vue";
import VolunteerPlatform from "@/pages/VolunteerPlatform.vue";
import DisabledPlatform from "@/pages/DisabledPlatform.vue";
export default new VueRouter({
    routes: [
//此处演示调用组件About的方式：
        {
            path: '/',
            name: 'HomePage',
            component: HomePage
        },
        {
            path:'/HomePage',
            name:'HomePage',
            component: HomePage
        },
        {
          path:'/LearnCenter',
          name:'LearnCenter',
          component: LearnCenter
        },
        {
            path:'/HelpForum',
            name:'HelpForum',
            component: HelpForum
        },
        // {
        //     path:'/AssistancePlatform',
        //     name:'AssistancePlatform',
        //     component: AssistancePlatform,
        //     children: [
        //
        //     ]
        // },
        {
            path:'/VolunteerPlatform',
            name:'VolunteerPlatform',
            component: VolunteerPlatform
        },
        {
            path:'/DisablePlatform',
            name:'DisablePlatform',
            component: DisabledPlatform
        },
        {
            path:"/AISystem",
            name:'AISystem',
            component: AISystem
        },
        {
            path:'/PersonalCenter',
            name:'PersonalCenter',
            component: PersonalCenter
        },
        {
            path:"/InformationFeedback",
            name:'InformationFeedback',
            component: InformationFeedback
        },
        {
            path:'/CreditsExchange',
            name:'CreditsExchange',
            component: CreditsExchange
        },
        {
            path:'/LoginPage',
            name:'LoginPage',
            component: LoginPage
        },
    ]

})
