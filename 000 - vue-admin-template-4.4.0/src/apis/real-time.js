import request from '@/utils/request_2'

// 封装获取参照平台的token的请求函数
export function getToken() {
    return request({
        url: '/video/webapi/user/login',
        method: 'post',
        data: {
            id: "OTIyLjkxMC4xNjA",
            secret: "11b322281f403559789f44a3ac86f44d"
        }
    });
}

// 添加获取视频数据的请求函数
export function getVideo(token, vehiclename, vehicleColor) {
    const apiUrl = `/alonevideo?token=${token}&vehiclename=${vehiclename}&ch=1&vehicleColor=${vehicleColor}&width=800&height=400`;

    return request({
        url: apiUrl,
        method: 'get'
    });
}
// 添加获取历史视频数据的请求函数
export function getHistoryVideo() {

    const apiUrl = `/alone_hisvideo?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGllbnRpZCI6MTIyNDIsInRraSI6OTY5NjQ3MDM0OTc2MDQ3MTA0LCJjcnQiOjE3MTEzNDgzMzM5NDAsImNsaWVudE5hbWUiOiLQorjQytC2r8zs1sfE3NDFz6K8vMr109DP3rmry74iLCJyb2xlaWQiOjczMSwidXNlcnR5cGUiOjAsImx0cCI6ImFwaSIsInR5cGVpZCI6MTUwMSwiZXhwIjoxNzQyODg0MzMzOTQwLCJ1c2VyaWQiOjkxMCwic2VydmVyaWQiOjIzMCwidXNlcm5hbWUiOiLL47eosuLK1CJ9.YmM1MWQzNWE1NjM2NmQyZjg4YTQ4Mzg2ZjZiYjJlNDM=&vehiclename=鄂K4J806&vehicleColor=5`;

    return request({
        url: apiUrl,
        method: 'get'
    });
}

// 获取实时车辆信息
export function getVehicleData(token, plates) {
    const apiUrl = '/video/webapi/location/get-location-use-plates';
    let platesString = plates.join(","); // 要求的参数格式是字符串
    // 构造请求体数据
    const requestData = {
        plates: platesString
    };

    // 设置请求头，包含 token
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    return request({
        url: apiUrl,
        method: 'post',
        headers: headers,
        data: requestData // 将请求体数据添加到请求中
    });
}