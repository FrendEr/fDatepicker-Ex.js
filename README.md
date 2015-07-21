# fDatepicker-Ex.js

[fDatepicker.js](https://github.com/FrendEr/fDatepicker.js)的拓展版本，可以选择特定日历区间，目前适用于M.WOQU.COM酒店业务线。

## Initialize

```javascript

var datepicker = new DatepickerHotel({
    container: '#datepickerContainer',
    selectStart: new Date('2015/7/24'),
    selectEnd: new Date('2015/7/29'),
    startDate: new Date('2015/7/3'),
    endDate: new Date('2016/7/3'),
    initFrame: 4,
    loadFrames: 3,
    loadOffset: 60,
    selectCallback: function(startDate, endDate, sumDates) {
        alert('Callback function!! 入住时间：' + startDate + ' 退房时间：' + endDate + ' 共' + sumDates + '天');
    }
});

```

## Demo

link：[http://frender.github.io/fDatepicker-Ex.js](http://frender.github.io/fDatepicker-Ex.js)

## Options

- **container** `@String`
> 需要制定的展示日历的根元素

- **initDate** `@String or @Date`
> 初始化的选中日期。如果使用`@String`类型，请遵循标准的YYYYMMDD模式，否则实现标准Date.parse的浏览器会报invalid date错误。下同。

- **selectStart** `@String or @Date`
> 用户选中的起始日期

- **selectEnd** `@String or @Date`
> 用户选中的结束日期

- **startDate** `@String or @Date`
> 日历的开始日期

- **endDate** `@String or @Date`
> 日历的结束日期

- **singleFrame** `@Boolean`
> 使用单个月份模式，支持月份切换

- **initFrames** `@Number`
> 【多月份模式】初始化的个数

- **loadFrames** `@Number`
> 【多月份模式】分页加载每页的个数

- **loadOffset** `@Number`
> 【多月份模式】动态加载的偏移量

- **i18n** `@Boolean`
> 开启国际化支持英文模式，默认使用中文模式

- **selectCallback** `@Function`
> 选择日期后的回调函数

## Installation

```javascript

bower install fDatepicker-Ex.js [--save[-dev]]

```
or

```javascript

npm install fdatepicker-ex.js [--save[-dev]]

```

## Version

- **1.0.0**
