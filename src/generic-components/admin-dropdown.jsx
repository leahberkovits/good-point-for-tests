import React, { useState, useCallback } from 'react';

// import './admin-dropdown.scss';

export const AdminDD = ({ ddItems, selectedItem, isError, handleItemclick, showDDItems, handleDDClick, handleDDBlur, arrowAnimation, className, itemsContainerClassName }) => {
    return (
        <div tabIndex="0" onBlur={handleDDBlur} className={`${className} order-dropdown ${isError ? "order-dropdown-error" : ""} ${showDDItems === null ? "" : (showDDItems ? "dd-open" : "dd-close")}`} onClick={handleDDClick}>
            <div className="arrow-down-container">
                <div className="placeholder" >{selectedItem && selectedItem.name ? selectedItem.name : ""}</div>
                <img className={`arrow-down ${arrowAnimation ? "arrow-down-animation" : "arrow-down-no-animation"}`} src="/images/admin-dd-arrow-down.svg" />
            </div>

            <div className={`dropdown-items ${itemsContainerClassName}`} >
                {ddItems.map(item =>
                    <div key={item.key} className={`${selectedItem && item.value === selectedItem.value ? " selected-item" : ""}${item.divideAbove ? " divide-above" : ""}${item.divideUnder ? " divide-under" : ""}`} onClick={() => { handleItemclick(item) }}>{item.name}</div>
                )}
            </div>
        </div>

    );
}
const NO_SEARCH = null;
export const AdminSearchDD = ({ ddItems, selectedItem, isError, handleItemclick, showDDItems, setShowDDItems, handleDDClick, handleDDBlur, arrowAnimation, className, itemsContainerClassName }) => {
    const [search, setSearch] = useState(NO_SEARCH); //! search doesnt work well

    const handleBlur = (e) => {
        setSearch(NO_SEARCH);
        handleDDBlur(e);
    }
    const handleClick = (e) => {
        setSearch(NO_SEARCH);
        handleDDClick(e);
    }

    console.log('! selectedItem: ', selectedItem);
    console.log('! showDDItems: ', showDDItems);
    console.log('! search: ', typeof search);

    return (
        <div tabIndex="0" onBlur={handleBlur} className={`${className} order-dropdown ${isError ? "order-dropdown-error" : ""} ${showDDItems === null ? "" : (showDDItems ? "dd-open" : "dd-close")}`} onClick={handleClick}>
            <div className="arrow-down-container">
                <input className="placeholder placeholder-input" onChange={(e) => { e.stopPropagation(); console.log("update search and show items"); setSearch(e.target.value || ""); setShowDDItems(true) }} value={typeof search === "string" ? search : (selectedItem && selectedItem.name ? selectedItem.name : "")} />
                <img className={`arrow-down ${arrowAnimation ? "arrow-down-animation" : "arrow-down-no-animation"}`} src="/images/admin-dd-arrow-down.svg" />
            </div>

            {/* <Select
                className={`dropdown-items ${itemsContainerClassName}`}
                native
                value={search ? search : (selectedItem && selectedItem.name ? selectedItem.name : "")}
                onChange={(e) => { handleChange(e, 'teacherName') }}
                inputProps={{ id: 'home-teacher-name-select-classes-edit' }}
            >
                {getTeacherNames()}
            </Select> */}

            <div className={`dropdown-items ${itemsContainerClassName}`} >
                {ddItems.map(item => {
                    console.log('typeof search !== "string") || (item.name && item.name.includes(search): ', typeof search !== "string") || (item.name && item.name.includes(search));
                    return (/* showDDItems &&  */(typeof search !== "string") || (item.name && item.name.includes(search))) //show this item
                        ? <div key={item.key} className={selectedItem && item.value === selectedItem.value ? "selected-item" : undefined} onClick={(e) => { e.stopPropagation(); console.log("teacher select"); handleItemclick(item); setSearch(NO_SEARCH); }}>{item.name || ""}</div>
                        : null
                })}
            </div>
        </div>

    );
}