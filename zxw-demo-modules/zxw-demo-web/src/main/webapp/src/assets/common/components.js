/*
*	@author: fany
*	@date:2016-02-15
*	@desc:组件收敛模块，将组件统一收敛至该文件
*/
define(['simpleTree', 'list', 'tab', 'select', 'selectTree'
], function(simpleTree, list, tab, select, selectTree) {

        return {
                zTree: simpleTree,
                List: list,
                Tab: tab,
                Select: select,
                SelectTree: selectTree,
        }
});