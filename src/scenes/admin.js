import React, { useEffect } from 'react';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import { OpenPopupsProvider } from '../contexts/openPopupsContext';
import ScrollButton from '../components/scroll_button';

import AdminStudentsTable from '../components/admin_students_table';
import AdminClassesTable from '../components/admin_classes_table';
import AdminPointsTable from '../components/admin_points_table';
import AdminTeachersTable from '../components/admin_teachers_table';
import AdminSettings from '../components/admin_settings';

import AdminNavBar from '../components/admin_nav_bar';
import AdminAddNewInstance from '../components/admin_add_new_instance';
// import { AdminStudentsSelectOptions } from '../components/admin_students_select_options';

import utils from '../components/functionUtils';
import consts from '../consts/consts';
import { getUrlParam } from '../consts/funcs';

import '../generic-components/admin-dropdown.scss';
import '../generic-components/admin-textInput.scss';
import '../components/CSS/admin.scss'; //! this must be imported ONLY if on admin
import '../components/CSS/admin_table_generator.scss';
import '../components/CSS/admin_animations.scss';
import '../components/CSS/admin_points_table.scss'
import '../components/CSS/admin_new_instance.scss'
import '../components/CSS/admin_add_items_excel.scss';
import { AdminRenderTopLeftOfStudentsTable } from '../components/admin_render_students_select_options';

const theme = createMuiTheme({
    direction: 'rtl',
    palette: {
        primary: {
            main: "#ef8142"
        }
    }
});

const Admin = ({ history, location }) => {
    const [nav, setNav] = React.useState(getUrlParam("n", location) || consts.ADMIN_POINTS_TABLE);
    const [scrollButton, setScrollButton] = React.useState(false);
    // const [selectedFiles, setSelectedFiles] = React.useState({});
    // useEffect(() => { //moved to admin context
    //     document.getElementById('admin-page-container').addEventListener('scroll', handleAppScroll);
    //     return () => document.getElementById('admin-page-container').removeEventListener('scroll', handleAppScroll);
    // }, []);
    useEffect(() => {
        window.history.pushState(null, null, "#/?n=" + nav);
    }, [nav]);





    let currTable = null;
    switch (nav) {
        case consts.ADMIN_POINTS_TABLE:
            currTable = <AdminPointsTable />
            break;
        case consts.ADMIN_STUDENTS_TABLE:
            currTable = <AdminStudentsTable />
            break;
        case consts.ADMIN_CLASSES_TABLE:
            currTable = <AdminClassesTable />
            break;
        case consts.ADMIN_TEACHERS_TABLE:
            currTable = <AdminTeachersTable />
            break;
        case consts.ADMIN_SETTINGS:
            currTable = <AdminSettings history={history} />
            break;
        default:
            // not a good param, set to default (-> points)
            setNav(consts.ADMIN_POINTS_TABLE);
            break;
    }

    return (
        <ThemeProvider theme={theme}>
            <OpenPopupsProvider>
                <div id="admin-page-container">
                    <AdminNavBar location={location} history={history} nav={nav} setNav={setNav} />

                    <div id="admin-table-and-table-top" >
                        {nav === consts.ADMIN_SETTINGS || nav === consts.ADMIN_POINTS_TABLE // don't show admin add new instance
                            ? null
                            : (nav === consts.ADMIN_STUDENTS_TABLE
                                // need to show admin add new instance, but if students_table now, adminStudnetsSelectOptions is incharge of that
                                ? <AdminRenderTopLeftOfStudentsTable currTable={nav} />
                                : <div id="admin-excel-uploader-container"><AdminAddNewInstance currTable={nav} /></div>)}
                        {currTable}

                    </div>

                    {scrollButton ? <ScrollButton id="up-button" icon={"arrow-up"} elem={scrollButton} x={0} y={0} /> : null}
                </div>
            </OpenPopupsProvider>
        </ThemeProvider>
    );
}

export default Admin;

export const handleTableContainerScroll = (e) => {
    return (e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + utils.viewportToPixels("10vh"))
}
