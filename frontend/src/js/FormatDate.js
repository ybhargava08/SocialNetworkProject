import dateformat from 'dateformat';

const  getDate = (inputStringDate)=> {
    const date = new Date(parseInt(inputStringDate));
    return dateformat(date,"mmmm dS, yyyy, h:MM:ss TT");
};

const  getDateNoSecs = (inputStringDate)=> {
    const date = new Date(parseInt(inputStringDate));
    return dateformat(date,"mmmm dS, yyyy, h:MM TT");
};

export {getDate,getDateNoSecs};