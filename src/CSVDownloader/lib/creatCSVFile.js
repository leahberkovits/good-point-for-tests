import { getT } from "../../translation/GPi18n";
module.exports = (datas, columns, separator = ',') => {
  const t = getT();
  if (!datas || (Array.isArray(datas) && !datas.length) || !Object.keys(datas).length) {
    return t("create_gp.not_sent");
  }
  let content = [];

  if ((typeof datas === 'object') && Array.isArray(datas)) {
    const dataType = Array.isArray(datas[0]);
    if (datas.some(x => (Array.isArray(x) !== dataType))) {
      return t("pop_up.error.create_file");
    }
    if (dataType) {
      content = content.concat(datas.map(v => v.join(separator)));
    } else {
      let columnOrder = [];
      // 可以优化 - ניתן למיטוב
      datas.forEach(x => columnOrder = columnOrder.concat(Object.keys(x)));
      // 去重 -  כפילות
      columnOrder = columnOrder.filter((value, index, self) => self.indexOf(value) === index);

      if (columnOrder.length > 0) {
        if (columns && (typeof columns === 'object')) {
          // 显示其他自定义头部 - הראה כותרות מותאמות אישית אחרות
          const temp = columnOrder.map((field) => {
            if (columns.hasOwnProperty(field)) {
              return columns[field];
            }
            return field;
          });

          content.push(temp.join(separator));
        } else {
          content.push(columnOrder.join(separator));
        }
      }

      datas.map(v => {
        return columnOrder.map(k => {
          if (typeof v[k] !== 'undefined') {
            return v[k];
          }
          return '';
        });
      }).forEach(v => {
        content.push(v.join(separator));
      });
    }
  } else if (typeof datas === 'object') {
    for (const field in datas) {
      if (columns && columns.hasOwnProperty(field)) {
        content.push(`${columns[field]},${datas[field]}`)
      } else {
        content.push(`${field},${datas[field]}`)
      }
    }
  } else {
    return datas;
  }

  return content.join('\r\n');
}
