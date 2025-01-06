// Time formatting helper functions
const formatTime = {
    padZero: (num) => String(num).padStart(2, '0'),

    getFormattedTime: function(date, format) {
        const hours24 = date.getHours();
        const hours12 = hours24 % 12 || 12;
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours24 >= 12 ? 'PM' : 'AM';
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // Replace format tokens with actual values
        return format
            .replace('HH', this.padZero(hours24))
            .replace('hh', this.padZero(hours12))
            .replace('H', hours24)
            .replace('h', hours12)
            .replace('mm', this.padZero(minutes))
            .replace('m', minutes)
            .replace('ss', this.padZero(seconds))
            .replace('s', seconds)
            .replace('a', ampm)
            .replace('YYYY', year)
            .replace('MM', this.padZero(month))
            .replace('DD', this.padZero(day));
    }
};