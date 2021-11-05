import { builtInTypes } from "./../modules/dashboard/enums/builtInTypes";
import { customTypes } from "./../modules/dashboard/enums/customTypes";
import { inputTypes } from "./../modules/dashboard/enums/inputTypes";
import { validationTypes } from "./../modules/dashboard/enums/validationTypes";
import { getT } from "../translation/GPi18n";
const t = getT();

const AdminConfig = {
    theme: {
        mainHeading: t("admin.projects.new_project"),
        secondaryHeading: t("admin.projects.second_t"),
        logo: "https://getbootstrap.com/docs/4.3/assets/brand/bootstrap-solid.svg",
        palette: {
            primary: "#008DFA",
            secondary: "#DCEFFE"
        }
    },
    pages: [
        {
            title: t("teachers"),
            route: "teachers",
            icon: ["fas", "th-list"],
            layouts: [
                {
                    grid: "col",
                    heading: t("teachers_list"),
                    content: [
                        {
                            components: [
                                {
                                    builtIn: builtInTypes.DATA_FROM_SERVER.TABLE,
                                    props: {
                                        model: "customuser",
                                        pluralized: "CustomUser"
                                    }

                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: t("students"),
            route: "students",
            icon: ["fas", "user-graduate"],
            layouts: [
                {
                    grid: "col",
                    heading: t("students_list"),
                    content: [
                        {
                            components: [
                                {
                                    builtIn: builtInTypes.DATA_FROM_SERVER.TABLE,
                                    props: {
                                        model: "students",
                                        title: "students"
                                        // pluralized: "CustomUsers"
                                    }

                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            
            title: t("classes"),
            route: "classes",
            icon: ["fas", "school"],
            layouts: [
                {
                    grid: "col",
                    heading: t("classes_list"),
                    content: [
                        {
                            components: [
                                {
                                    builtIn: builtInTypes.DATA_FROM_SERVER.TABLE,
                                    props: {
                                        model: "classes",
                                        title: "classes",
                                        pluralized: "Classes"
                                    }

                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            
            title: t("opening_sent"),
            route: "preset_messages",
            icon: ["fas", "comment"],
            layouts: [
                {
                    grid: "col",
                    heading: t("opening_list"),
                    content: [
                        {
                            components: [
                                {
                                    builtIn: builtInTypes.DATA_FROM_SERVER.TABLE,
                                    props: {
                                        model: "preset_messages",
                                        title: "preset_messages"
                                        // pluralized: "CustomUsers"
                                    }

                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {            
            title: t("admin.projects.deleted_opening"),
            route: "removed_preset_messages",
            icon: ["fas", "comment-slash"],
            layouts: [
                {
                    grid: "col",
                    heading: t("admin.projects.personal_delete_opening"),
                    content: [
                        {
                            components: [
                                {
                                    builtIn: builtInTypes.DATA_FROM_SERVER.TABLE,
                                    props: {
                                        model: "removed_preset_messages",
                                        title: "removed_preset_messages"
                                        // pluralized: "CustomUsers"
                                    }

                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {            
            title: t("greetings.x_gps"),
            route: "good_points",
            icon: ["fas", "hand-holding-heart"],
            layouts: [
                {
                    grid: "col",
                    heading: t("greetings.x_gps"),
                    content: [
                        {
                            components: [
                                {
                                    builtIn: builtInTypes.DATA_FROM_SERVER.TABLE,
                                    props: {
                                        model: "good_points",
                                        title: "good_points"
                                        // pluralized: "CustomUsers"
                                    }

                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}

export default AdminConfig;