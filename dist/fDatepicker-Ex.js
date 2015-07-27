/* =======================================================
 *
 *  @name        datepicker.js
 *  @author      Frend
 *  @version     1.0.0
 *  @dependency  jQuery
 *  @fork        https://github.com/FrendEr/fDatepicker.js
 *  @github      https://github.com/FrendEr/fDatepicker-Ex.js
 *
 * ======================================================= */

!function(root, factory) {
    if (typeof define == 'function' && define.amd) {
        define(['jquery'], function($) {
            return factory();
        });
    } else if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        window[root] = factory();
    }
}('Datepicker', function() {

    'use strict';

    Datepicker.VERSION = '1.0.0';

    Datepicker.DEFAULT = {
        container        : '',
        initDate         : '',
        selectStart      : '',
        selectEnd        : '',
        startDate        : '',
        endDate          : '',
        weekFixed        : true,
        singleFrame      : false,
        initFrames       : 3,
        loadFrames       : 3,
        loadOffset       : 100,
        i18n             : false,
        startCallback    : $.noop,
        endCallback      : $.noop,
        completeCallback : $.noop
    };

    function Datepicker(options) {
        var options = $.extend(Datepicker.DEFAULT, options);

        this.$container       = $(options.container);
        this.initDate         = UTILS.formatDateObj(options.initDate && typeof options.initDate == 'string' ? new Date(options.initDate) : options.initDate);
        this.startDate        = UTILS.formatDateObj(typeof options.startDate == 'string' ? new Date(options.startDate) : options.startDate);
        this.endDate          = UTILS.formatDateObj(typeof options.endDate == 'string' ? new Date(options.endDate) : options.endDate);
        this.weekFixed        = options.singleFrame ? false : options.weekFixed;
        this.initFrames       = options.initFrame;
        this.restFrames       = 0;
        this.loadFrames       = options.loadFrames;
        this.tmpYear          = 0;
        this.tmpMonth         = 0;
        this.loadOffset       = options.loadOffset;
        this.singleFrame      = options.singleFrame;
        this.i18n             = options.i18n;
        this.selectStart      = UTILS.formatDateObj(typeof options.selectStart == 'string' ? new Date(options.selectStart) : options.selectStart);
        this.selectEnd        = UTILS.formatDateObj(typeof options.selectEnd == 'string' ? new Date(options.selectEnd) : options.selectEnd);
        this.startCallback    = options.startCallback;
        this.endCallback      = options.endCallback;
        this.completeCallback = options.completeCallback;

        // cache after props set
        var self = this;

        // init scroll event
        $(window).on('scroll', $.proxy(this.scrollLoad, this));

        // init select event
        this.$container.on('click', 'span[data-date]', $.proxy(this.initEvents, this));

        // init month exchange event in singleFrame mode
        if (this.singleFrame) {
            this.$container.on('click', '#prevBtn, #nextBtn', function(event) {
                UTILS.monthExchange(event.target, self.tmpYear || self.getInitYear() || self.getStartYear(), (self.tmpYear != 0 && self.tmpMonth >= 0) ? self.tmpMonth : (self.getInitMonth() || self.getStartMonth()), self);
            });
        }

        // init datepicker
        this.init();
    }

    Datepicker.prototype = {

        constructor: Datepicker,

        init: function() {
            var self = this,
                startYear = this.singleFrame ? (this.getInitYear() ? this.getInitYear() : this.getStartYear()) : this.getStartYear(),
                startMonth = this.singleFrame ?(this.getInitMonth() ? this.getInitMonth() : this.getStartMonth()) : this.getStartMonth(),
                endYear = this.getEndYear(),
                endMonth = this.getEndMonth();

            // invalid params, end date must large than start date
            if ((startYear > endYear) || (startYear == endYear && startMonth > endMonth)) return;

            // if weeks fixed top
            var weeksTpl = '<div style="height: 22px;"></div>\
                            <div class="datepicker-table fixed">\
                                <span class="dp-th">日</span>\
                                <span class="dp-th">一</span>\
                                <span class="dp-th">二</span>\
                                <span class="dp-th">三</span>\
                                <span class="dp-th">四</span>\
                                <span class="dp-th">五</span>\
                                <span class="dp-th">六</span>\
                            </div>';
            this.weekFixed && this.$container.append(weeksTpl);

            // render single month
            if (this.singleFrame || (startYear == endYear && startMonth == endMonth)) {
                this.$container.append(UTILS.renderSinglePicker(startYear, startMonth, self));
                return;
            }

            // render multiple months
            if (!this.singleFrame) {
                this.restFrames = (endYear - startYear) * 12 + endMonth - startMonth - this.initFrames;

                if (this.restFrames > 0) {
                    var endY = this.tmpYear = startYear + ((startMonth + this.initFrames) > 11 ? 1 : 0),
                        endM = this.tmpMonth = (startMonth + this.initFrames - 1) % 12;

                    this.$container.append(UTILS.renderMultiplePicker(startYear, startMonth, endY, endM, self));
                } else {
                    this.$container.append(UTILS.renderMultiplePicker(startYear, startMonth, endYear, endMonth, self));
                }
            }
        },

        initEvents: function(event) {
            var $this = event.target.tagName.toLowerCase() == 'span' ? $(event.target) : $(event.target).parents('span');

            // if the item is outdate or today,
            // do nothing but just return
            if ($this.is('.is-outdate') || $this.is('.is-today')) return;

            // clear all ".is-inner" items
            this.$container.find('.is-inner').removeClass('is-inner');
            // set start date or end date
            if (!this.selectStart) {
                $this.addClass('selected check-in');
                this.selectStart = new Date($this.data('date'));

                // start date select callback
                this.startCallback.call(this, UTILS.formatDateString(this.selectStart, '-'));
            } else if (this.selectStart && !this.selectEnd) {
                var sumDates = (new Date($this.data('date')) - this.selectStart) / (24 * 3600 * 1000);

                if (this.selectStart < new Date($this.data('date')) && sumDates < 20) {
                    $this.addClass('selected check-out');
                    this.selectEnd = new Date($this.data('date'));

                    // complete callback
                    this.completeCallback.call(this, UTILS.formatDateString(this.selectStart, '-'), UTILS.formatDateString(this.selectEnd, '-'), sumDates);
                } else {
                    this.$container.find('.selected').removeClass('selected check-in check-out');
                    $this.addClass('selected check-in');
                    this.selectStart = new Date($this.data('date'));

                    // start date select callback
                    this.startCallback.call(this, UTILS.formatDateString(this.selectStart, '-'));
                }
            } else if (this.selectStart && this.selectEnd) {
                this.$container.find('.selected').removeClass('selected check-in check-out');
                $this.addClass('selected check-in');
                this.selectStart = new Date($this.data('date'));
                this.selectEnd = '';

                // start date select callback
                this.startCallback.call(this, UTILS.formatDateString(this.selectStart, '-'));
            }
            // set ".is-inner" items
            if (this.selectStart && this.selectEnd) {
                this.setInnerDates();
            }

        },

        setInnerDates: function() {
            var self = this,
                $container = self.$container,
                startDate = UTILS.formatDateString(self.selectStart, '/'),
                endDate = UTILS.formatDateString(self.selectEnd, '/'),
                range = (self.selectEnd - self.selectStart) / (24 * 3600 * 1000) - 1,
                startDateItem = $container.find('span[data-date="' + startDate + '"]'),
                endDateItem = $container.find('span[data-date="' + endDate + '"]'),
                tmpStartItem = startDateItem.next('[data-date]'),
                tmpEndItem = endDateItem.prev('[data-date]');

            while (range) {
                // from start to end
                tmpStartItem.length && range--;
                tmpStartItem.addClass('is-inner');
                tmpStartItem = tmpStartItem.next('[data-date]');

                // from end to start
                tmpEndItem.length && range && range--;
                tmpEndItem.addClass('is-inner');
                tmpEndItem = tmpEndItem.prev('[data-date]');
            }
        },

        getInitYear: function() {
            return this.initDate.getFullYear();
        },

        getInitMonth: function() {
            return this.initDate.getMonth();
        },

        getStartYear: function() {
            return this.startDate.getFullYear();
        },

        getStartMonth: function() {
            return this.startDate.getMonth();
        },

        getEndYear: function() {
            return this.endDate.getFullYear();
        },

        getEndMonth: function() {
            return this.endDate.getMonth();
        },

        getEndDate: function() {
            return this.endDate;
        },

        scrollLoad: function() {
            // when the restFrames is not empty, trigger scrolling to load
            if (this.restFrames <= 0) return;

            var self = this,
                $window = $(window),
                $document = $(document),
                startYear = this.tmpYear,
                startMonth = this.tmpMonth + 1,
                endYear,
                endMonth;

            if (($document.height() - $window.height() - $window.scrollTop()) < this.loadOffset) {
                if (this.restFrames <= this.loadFrames) {
                    this.restFrames = 0;
                    endYear = this.getEndYear();
                    endMonth = this.getEndMonth();

                    this.$container.append(UTILS.renderMultiplePicker(startYear, startMonth, endYear, endMonth, self));
                } else {
                    this.restFrames -= this.loadFrames;
                    endYear = this.tmpYear = startYear + ((startMonth + this.loadFrames) > 11 ? 1 : 0);
                    endMonth = this.tmpMonth = (startMonth + this.loadFrames - 1) % 12;
                    this.$container.append(UTILS.renderMultiplePicker(startYear, startMonth, endYear, endMonth, self));
                }

            }
        }

    }

    // util function and variable
    // ==========================
    var UTILS = {

        weeks      : ['日', '一', '二', '三', '四', '五', '六'],
        weeksi18n  : ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'],
        months     : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        monthsi18n : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        holiday    : {
            '1/1'  : '元旦',
            '5/1'  : '劳动节',
            '6/1'  : '儿童节',
            '10/1' : '国庆节',
            '12/25': '圣诞节'
        },

        getCurrentDate: function() {
            return new Date();
        },

        getMonthFirstDay: function(year, month) {
            return new Date(year, month, 1).getDay();
        },

        getMonthLastDay: function(year, month) {
            return new Date(year, month + 1, 0).getDate();
        },

        formatDateString: function(date, separator) {
            var date = typeof date === 'string' ? new Date(date) : date;

            return parseInt(date.getFullYear()) + separator + (parseInt(date.getMonth()) + 1) + separator + parseInt(date.getDate());
        },

        formatDateObj: function(date) {
            var date = typeof date === 'string' ? new Date(date) : date;

            return new Date(date.getFullYear() + '/' + (parseInt(date.getMonth()) + 1) + '/' + parseInt(date.getDate()));
        },

        fillArr: function(year, month) {
            var firstDay = this.getMonthFirstDay(year, month),
                lastDay = this.getMonthLastDay(year, month),
                totleDays = lastDay,
                arr = (firstDay + lastDay > 36) ? new Array(42) : (firstDay + lastDay > 28) ? new Array(35) : new Array(28);

            for (var j = firstDay, i = 0; i < totleDays; i++, j++) {
                arr[j] = year + '/' + (month + 1) + '/' + (i + 1);
            }

            return arr;
        },

        monthExchange: function(target, year, month, datepickerObj) {
            var $this = $(target),
                className = $this[0].className;

            if (className.indexOf('disable-btn') != -1) return;
            // prev month
            if (className.indexOf('prev-btn') != -1) {
                (month - 1 >= 0) ? (function() {
                    datepickerObj.tmpYear = year;
                    datepickerObj.tmpMonth = month - 1;
                })() : (function() {
                    datepickerObj.tmpYear = year - 1;
                    datepickerObj.tmpMonth = 11;
                })();
                datepickerObj.$container.empty().append(this.renderSinglePicker(datepickerObj.tmpYear, datepickerObj.tmpMonth, datepickerObj));
            }
            // next month
            if (className.indexOf('next-btn') != -1) {
                (month + 1 <= 11) ? (function() {
                    datepickerObj.tmpYear = year;
                    datepickerObj.tmpMonth = month + 1;
                })() : (function() {
                    datepickerObj.tmpYear = year + 1;
                    datepickerObj.tmpMonth = 0;
                })();
                datepickerObj.$container.empty().append(this.renderSinglePicker(datepickerObj.tmpYear, datepickerObj.tmpMonth, datepickerObj));
            }
        },

        renderSinglePicker: function(year, month, datepickerObj) {
            var arr = this.fillArr(year, month),
                currentDate = this.getCurrentDate(),
                endDate = datepickerObj.getEndDate(),
                selectStart = datepickerObj.selectStart && datepickerObj.selectStart.getTime(),
                selectEnd = datepickerObj.selectEnd && datepickerObj.selectEnd.getTime(),
                $tpl = this.renderPickerHead(year, month, datepickerObj);

            return $tpl.append(this.renderPickerBody(arr, currentDate, endDate, selectStart, selectEnd));
        },

        renderPickerHead: function(year, month, datepickerObj) {
            var weeksMap = datepickerObj.i18n ? this.weeksi18n : this.weeks,
                ym = datepickerObj.i18n ? (this.monthsi18n[month] + ' ' + year) : (year + '年 ' + this.months[month]),
                prev = datepickerObj.singleFrame ? '<i id="prevBtn" class="prev-btn ' + (year == datepickerObj.getStartYear() && (month == datepickerObj.getStartMonth()) ? 'disable-btn' : '') + '">&lt;</i>' : '',
                next = datepickerObj.singleFrame ? '<i id="nextBtn" class="next-btn ' + (year == datepickerObj.getEndYear() && (month == datepickerObj.getEndMonth()) ? 'disable-btn' : '') + '">&gt;</i>' : '',
                hd =  prev + ym + next,
                $tpl = $('<div class="datepicker-table">' +
                    '<h2 id="dpHeader" class="datepicker-header">' + hd + '</h2>' +
                    (function() {
                        var th = '';

                        if (!datepickerObj.weekFixed) {
                            for (var i = 0; i < weeksMap.length; i++) {
                                th += '<span class="dp-th">' + weeksMap[i] + '</span>';
                            }
                        }
                        return th;
                    })() +
                '</div>');

            return $tpl;
        },

        renderPickerBody: function(arr, currentDate, endDate, selectStart, selectEnd) {
            var tmp = '';

            for (var i = 0; i < arr.length; i++) {
                arr[i] == undefined ?
                (tmp += '<span></span>') :
                (function(i) {
                    var itemArr = arr[i].split('/'),
                        itemYear = parseInt(itemArr[0]),
                        itemMonth = parseInt(itemArr[1]) - 1,
                        itemDate = parseInt(itemArr[2]),
                        className = '';

                    // is out of date
                    className += (new Date(arr[i]) < currentDate || new Date(arr[i]) > endDate ) ? 'is-outdate ' : '';
                    // is today
                    className += (currentDate.getFullYear() == itemYear && parseInt(currentDate.getMonth()) == itemMonth && parseInt(currentDate.getDate()) == itemDate) ? 'is-today ' : '';
                    // is selected
                    className += (className.indexOf('is-outdate') != -1) ? '' : (className.indexOf('is-today') != -1) ? '' : (new Date(arr[i]).getTime() == selectStart) ? 'selected check-in' : (new Date(arr[i]).getTime() == selectEnd) ? 'selected check-out' : (new Date(arr[i]).getTime() > selectStart && new Date(arr[i]).getTime() < selectEnd) ? 'is-inner' : '';

                    if (i % 7 == 0 || i % 7 == 6) {
                        className += ' is-weekend';
                    }

                    tmp += '<span class="' + className + '" data-date="' + arr[i] + '"><i>' + itemDate + '</i></span>';
                })(i);
            }

            return tmp;
        },

        renderMultiplePicker: function(startYear, startMonth, endYear, endMonth, datepickerObj) {
            var yearDist = endYear - startYear,
                monthDist = yearDist * 12 + endMonth - startMonth,
                $tpl = $('<div/>');

            for (var i = 0; i <= monthDist; i++) {
                var month = (startMonth + i) % 12,
                    year = (startMonth + i) >= 12 ? startYear + 1 : startYear;

                $tpl.append(this.renderSinglePicker(year, month, datepickerObj));
            }

            return $tpl;
        }
    }

    return Datepicker;

});
