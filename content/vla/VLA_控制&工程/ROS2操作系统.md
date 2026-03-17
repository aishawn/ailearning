franka
fetch
mobile aloha 等真机开发经验


我在机器人/视觉项目中使用过 ROS 进行算法部署。  
主要工作包括将视觉算法封装为 ROS node，通过 topic 订阅相机数据并发布检测或定位结果。

在系统中我主要使用 publish/subscribe 机制进行模块通信，并利用 rosbag 进行数据录制与离线调试，通过 RViz 做结果可视化。  
在系统架构上，通常会将传感器节点、感知节点和控制节点进行解耦，通过 ROS 实现模块化集成。