import React, { useMemo } from 'react';
import { inject, observer } from 'mobx-react'
import { useTranslate } from '../translation/GPi18n';
import InfiniteScroll from 'react-infinite-scroll-component';

import ClassesUtils from './ClassesUtils'
import consts from '../consts/consts';

import { AdminDD } from '../generic-components/admin-dropdown';
import { useConsts } from '../contexts/constsContext';


let ddTO = null;
const ARROW_ANIMATION_DURATION = 400; //ms
const AdminPointsTable = (props) => {
    const { t, i18n } = useTranslate();
    const { ADMIN_POINTS_CLASSES_SORT,
        GET_HEBREW_GRADES,
        ADMIN_POINTS_TEACHERS_SORT,
        ADMIN_POINTS_DATE_SORT,
        ADMIN_NO_FILTER,
        ADMIN_POINTS_FETCH_LIMIT,
        TEXT_BOX_CHAR_LIMIT } = useConsts();
    const [showDDItems, setShowDDItems] = React.useState(null);
    const [arrowAnimation, setArrowAnimation] = React.useState(false);
    const [showMoreIndex, setShowMoreIndex] = React.useState(-1);

    const [ddPlaceholder, setDDPlaceholder] = React.useState(null);

    const sort = props.GoodPointsStore.adminPointsSort;
    const points = props.GoodPointsStore.adminGPs;

    let sortSection = null;
    let [pointsTDs, pointsLength] = useMemo(() => {
        if (!points) return [t("loading"), 0]
        if (!Array.isArray(points)) return [points, points.length];
        return !points.length ? [`${t("errors.not_found")} ${t("greetings.x_gps")}`, 0] : [points.map((gp, index, pointsArr) => {
            if (sort === consts.ADMIN_POINTS_CLASSES_SORT)
                sortSection = pointsArr[index + 1] ? pointsArr[index + 1].Student.Class.grade > gp.Student.Class.grade : false;
            else if (sort === ADMIN_POINTS_TEACHERS_SORT)
                sortSection = pointsArr[index + 1] ? pointsArr[index + 1].Teacher.firstName + pointsArr[index + 1].Teacher.lastName !== gp.Teacher.firstName + gp.Teacher.lastName : false;
            else if (sort === ADMIN_POINTS_DATE_SORT) {
                sortSection = pointsArr[index + 1] ? pointsArr[index + 1].created.substr(5, 2) !== gp.created.substr(5, 2) : false; //sections by month
            }
            const created = gp.created.substring(0, 10);

            let text = typeof gp.gpText === "string" ? gp.gpText.substr(0, TEXT_BOX_CHAR_LIMIT) : "";
            let showMoreText = t("admin.gps.show_more")
            if (typeof gp.gpText === "string" && gp.gpText.length > TEXT_BOX_CHAR_LIMIT) {
                if (Number(showMoreIndex) === Number(index)) {
                    text = gp.gpText;
                    showMoreText = " " + t("admin.gps.show_less");
                }
            }
            else {
                showMoreText = "";
            }
            return (
                <tr key={gp.id} className={`${sortSection ? "sort-section-underline" : ""}`}>
                    <td> {gp.Student.firstName + " " + gp.Student.lastName} </td>
                    <td> {GET_HEBREW_GRADES[gp.Student.Class.grade - 1] + " " + gp.Student.Class.classIndex} </td>
                    <td> {gp.Teacher.firstName + " " + gp.Teacher.lastName}</td>
                    <td> {`${created.split(/\-/g)[2]}.${created.split(/\-/g)[1]}.${created.split(/\-/g)[0].substr(2, 2)} `}</td>
                    <td> {text} <span onClick={() => { showMore(index) }} className="show-more-span">{showMoreText}</span></td>
                </tr>
            );
        }), points.length]
    }, [points, showMoreIndex]);

    const hasMorePoints = props.GoodPointsStore.adminHasMorePoints;

    const showMore = (index) => {
        setShowMoreIndex(currIndex => currIndex === index ? -1 : index);
    }

    const handleOrderDDClick = (e) => {
        clearTimeout(ddTO);
        setShowDDItems(v => !v);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const handleOrderDDBlur = () => {
        if (!showDDItems) return;
        clearTimeout(ddTO);
        setShowDDItems(false);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const setPointsSort = (item) => {
        setDDPlaceholder(item)
        props.GoodPointsStore.setSortAdminGPs(item.value);
    }

    const DD_ITEMS = useMemo(() => (
        !ddPlaceholder || ddPlaceholder.value === ADMIN_NO_FILTER
            ? [{ key: "k0", name: t("admin.gps.date"), value: ADMIN_POINTS_DATE_SORT }, { key: "k1", name: t("admin.classes.class_age"), value: ADMIN_POINTS_CLASSES_SORT }, { key: "k2", name: t("teacher"), value: ADMIN_POINTS_TEACHERS_SORT }] // without no filter option
            : [{ key: "k0", name: t("genders.none"), value: ADMIN_NO_FILTER }, { key: "k1", name: t("admin.gps.date"), value: ADMIN_POINTS_DATE_SORT }, { key: "k2", name: t("admin.classes.class_age"), value: ADMIN_POINTS_CLASSES_SORT }, { key: "k3", name: t("teacher"), value: ADMIN_POINTS_TEACHERS_SORT }] // with no filter option
    ), [ddPlaceholder])



    return (<>
        <div id="admin-points-filter-bar" className="admin-filter-bar-container">
            <div className="table-name">{t("points")}</div>
            <div className="order-container">
                <div>{`${t("admin.gps.order_by")}:`}</div>
                <AdminDD
                    onBlur={handleOrderDDBlur}
                    showDDItems={showDDItems}
                    handleDDClick={handleOrderDDClick}
                    arrowAnimation={arrowAnimation}
                    ddItems={DD_ITEMS}
                    selectedItem={ddPlaceholder && ddPlaceholder.value === ADMIN_NO_FILTER ? { value: ADMIN_NO_FILTER } : ddPlaceholder}
                    handleItemclick={setPointsSort}
                />
            </div>
        </div>
        <div id="points-table-container" className="admin-table-container">

            <InfiniteScroll
                dataLength={pointsLength}
                next={() => { props.GoodPointsStore.adminFetchMoreGPs() }}
                hasMore={hasMorePoints}
                scrollableTarget={'app'}
                scrollThreshold={1}
                loader={<img src="/images/loading2.gif" height={"50vh"} />}
            >
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t("admin.gps.students_name")}</th>
                            <th>{t("class")}</th>
                            <th>{t("admin.gps.sender")}</th>
                            <th>{t("admin.gps.date")}</th>
                            <th>{t("good_point")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {typeof pointsTDs === "string" ? null : pointsTDs}
                    </tbody>
                </table>
                {typeof pointsTDs === "string" ? <div className="no-table-data">{pointsTDs}</div> : null}
                {/* {typeof isInfiniteScrollLoading === "string" ? <img src="/images/loading2.gif" height={"50vh"} /> : null} */}

            </InfiniteScroll>
        </div >
    </>
    );
}

export default inject("GoodPointsStore")(observer(AdminPointsTable));