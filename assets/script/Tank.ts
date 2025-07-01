import { _decorator, Component, Vec3, Vec2, input, Input, EventTouch, Node, Quat, math, RigidBody2D, Collider2D } from 'cc';
const { ccclass, property } = _decorator;
// 在文件顶部添加常量
const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;
@ccclass('Tank')
export class Tank extends Component {
    @property({ type: Node })
    joystick: Node = null; // 摇杆节点

    @property
    moveSpeed: number = 5; // 移动速度
    
    @property
    rotateSpeed: number = 180; // 旋转速度(度/秒)

    @property
    turretRotateSpeed: number = 120; // 炮塔旋转速度(度/秒)

    @property({ type: Node })
    turret: Node = null; // 炮塔节点

    private _joystickComp: any = null;
    private _moveDirection: Vec3 = new Vec3();
    private _targetRotation: number = 0;
    private _turretTargetRotation: number = 0;
// 在onLoad中添加初始化
protected onLoad() {
    // // 确保初始没有旋转和缩放形变
    // this.node.setScale(Vec3.ONE);
    // this.node.setRotation(Quat.IDENTITY);
    
    // // 检查子节点
    // if (this.turret) {
    //     this.turret.setScale(Vec3.ONE);
    //     this.turret.setRotation(Quat.IDENTITY);
    // }
    //     // 确保初始状态正确
        // 确保使用物理系统
        if (!this.rigidBody) {
            this.rigidBody = this.getComponent(RigidBody2D);
        }
        this.rigidBody.gravityScale = 0; // 禁用重力
    }
    protected start() {
        // 获取摇杆组件
        this._joystickComp = this.joystick.getComponent('Joystick');
        
        // 监听触摸事件用于炮塔旋转
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
    }

    protected onDestroy() {
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
    }
    private _currentAngle: number = 0; // 当前角度（度）
    private _targetAngle: number = 0;
    @property(RigidBody2D)
    rigidBody: RigidBody2D = null; // 必须添加RigidBody2D组件
    @property(Collider2D)
    collider: Collider2D = null; // 必须添加Collider2D组件
    @property
    moveForce: number = 5; // 改为力模式更符合物理系统
    @property
    torque: number = 20; // 旋转扭矩值
    private _getAngleDiff(current: number, target: number): number {
        let diff = target - current;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return diff;
    }
    protected update(deltaTime: number) {
        if (!this._joystickComp) return;

        // 获取摇杆输入
        const direction = this._joystickComp.getDirection();
        const intensity = this._joystickComp.getIntensity();

        // 移动控制
        if (intensity > 0.1) {
            // 计算目标角度（注意Cocos的坐标系）
            this._targetAngle = Math.atan2(direction.x, direction.y) * RAD2DEG;
            console.log("targetAngle", this._targetAngle);
            // 2D旋转差（简化版）
            const angleDiff = this._getAngleDiff(this.node.angle, this._targetAngle);
            const rotationDir = angleDiff > 0 ? 1 : -1;
            
            // 应用旋转扭矩
            this.rigidBody.applyTorque(rotationDir * this.torque * intensity, false);
            
            // 计算前进方向（2D简化）
            const rad = this.node.angle * DEG2RAD;
            const moveDir = new Vec2(
                Math.sin(rad),
                Math.cos(rad)
            );
            
            // 应用移动力
            this.rigidBody.applyForceToCenter(
                moveDir.multiplyScalar(this.moveForce * intensity),
                true
            );
            // 角度差值处理
            let angleDelta = this._targetAngle - this._currentAngle;
            angleDelta = ((angleDelta + 180) % 360) - 180; // 归一化到[-180,180]
            
            // // 限制旋转速度
            // const maxRotDelta = this.rotateSpeed * deltaTime;
            // const appliedRotDelta = Math.sign(angleDelta) * 
            //                       Math.min(Math.abs(angleDelta), maxRotDelta);
            
            // this._currentAngle += appliedRotDelta;
            
            // // 应用旋转（仅修改Y轴）
            // this.node.setRotationFromEuler(0, this._currentAngle, 0);
            
            // // 移动（使用当前角度）
            // this._moveTank(intensity, deltaTime);
        // // 1. 先计算目标角度（注意Cocos的坐标系）
        // const targetAngle = Math.atan2(direction.x, direction.y) * RAD2DEG;
        
        // // 2. 平滑旋转到目标角度
        // this._rotateTank(targetAngle, deltaTime);
        
        // 3. 沿着当前前方移动
        // this._moveTank(intensity, deltaTime);
            // // 移动和旋转逻辑
            // const moveAngle = Math.atan2(direction.x, direction.y) * RAD2DEG;
            // this._rotateTank(moveAngle, deltaTime);
            // this._moveTank(intensity, deltaTime);
            // // 计算移动方向
            // this._moveDirection.set(direction.x, 0, direction.y);
            
            // // 计算目标朝向(只处理x,z平面)
            // this._targetRotation = Math.atan2(direction.x, direction.y) * RAD2DEG;
            
            // // 平滑旋转坦克
            // const currentRotation = this.node.eulerAngles.y;
            // const rotationDelta = this._calculateRotationDelta(currentRotation, this._targetRotation);
            
            // // 限制旋转速度
            // const maxRotation = this.rotateSpeed * deltaTime;
            // const appliedRotation = Math.sign(rotationDelta) * Math.min(Math.abs(rotationDelta), maxRotation);
            
            // this.node.eulerAngles = new Vec3(
            //     0,
            //     currentRotation + appliedRotation,
            //     0
            // );
            
            // // 移动坦克(前进和后退)
            // const moveDistance = this.moveSpeed * intensity * deltaTime;
            // const forward = new Vec3();
            // Vec3.transformQuat(forward, Vec3.FORWARD, this.node.rotation);
            // forward.normalize();
            
            // this.node.position = this.node.position.add(forward.multiplyScalar(moveDistance));
        }

        // 炮塔旋转控制
        // if (this.turret) {
        //     const currentTurretRot = this.turret.eulerAngles.y;
        //     const turretRotationDelta = this._calculateRotationDelta(currentTurretRot, this._turretTargetRotation);
            
        //     if (Math.abs(turretRotationDelta) > 1) {
        //         const maxTurretRotation = this.turretRotateSpeed * deltaTime;
        //         const appliedTurretRotation = Math.sign(turretRotationDelta) * Math.min(Math.abs(turretRotationDelta), maxTurretRotation);
                
        //         this.turret.eulerAngles = new Vec3(
        //             0,
        //             currentTurretRot + appliedTurretRotation,
        //             0
        //         );
        //     }
        // }
    }private _rotateTank(targetAngle: number, deltaTime: number) {
    const currentAngle = this.node.eulerAngles.y;
    const angleDelta = this._normalizeAngle(targetAngle - currentAngle);
    
    const maxRotation = this.rotateSpeed * deltaTime;
    const rotation = Math.sign(angleDelta) * Math.min(Math.abs(angleDelta), maxRotation);
    console.log('rotation:', rotation, targetAngle, currentAngle);
    this.node.angle = currentAngle + rotation;
    // this.node.setRotationFromEuler(0, currentAngle + rotation, 0);
}
    private _moveTank(intensity: number, deltaTime: number) {
        // 计算前进方向（使用角度）
        const rad = this._currentAngle * DEG2RAD;
        const moveDir = new Vec3(
            Math.sin(rad), 
            0,
            Math.cos(rad)
        );
        
        // 计算移动量
        const moveDistance = this.moveSpeed * intensity * deltaTime;
        const movement = moveDir.multiplyScalar(moveDistance);
        
        // 应用位置变化（保持原有缩放）
        const newPos = this.node.position.clone().add(movement);
        this.node.position = newPos;
    }

private _moveTank2(intensity: number, deltaTime: number) {
    // 获取坦克当前正前方向量（在本地坐标系是Vec3.FORWARD）
    // const forward = new Vec3();
    // this.node.getForward(forward);
    
    // 计算移动距离和方向
    const moveDistance = this.moveSpeed * intensity * deltaTime;
    const movement = this.node.forward.multiplyScalar(moveDistance);
    
    // 更新位置
    this.node.position = this.node.position.add(movement);
}
private _normalizeAngle(angle: number): number {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
}

    private _onTouchStart(event: EventTouch) {
        this._updateTurretTargetRotation(event);
    }

    private _onTouchMove(event: EventTouch) {
        this._updateTurretTargetRotation(event);
    }
// private _updateTurretTargetRotation(event: EventTouch) {
//     if (!this.turret) return;
    
//     // 获取触摸位置（屏幕坐标转世界坐标）
//     const touchPos = event.getUILocation();
//     const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
    
//     // 转换为坦克节点下的局部坐标
//     const localPos = new Vec3();
//     this.node.inverseTransformPoint(localPos, worldPos);
    
//     // 计算角度（注意Y轴是向上的，所以使用x/z平面）
//     this._turretTargetRotation = Math.atan2(localPos.x, localPos.z) * RAD2DEG;
// }
    private _updateTurretTargetRotation(event: EventTouch) {
        if (!this.turret) return;
        
        // 获取触摸位置的世界坐标
        const touchPos = event.getUILocation();
        const worldPos = new Vec3(touchPos.x, 0, touchPos.y);
        
        // 转换为坦克局部坐标
        const localPos = new Vec3();
        this.node.inverseTransformPoint(localPos, worldPos);
        // const localPos = this.node.inverseTransformPoint(worldPos);
        
        // 计算炮塔应该朝向的角度
        this._turretTargetRotation = Math.atan2(localPos.x, localPos.z) * RAD2DEG;
    }

    private _calculateRotationDelta(current: number, target: number): number {
        // 规范化角度到0-360范围
        current = ((current % 360) + 360) % 360;
        target = ((target % 360) + 360) % 360;
        
        // 计算最短旋转路径
        let delta = target - current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        
        return delta;
    }
}
