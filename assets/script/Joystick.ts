import { _decorator, Component, Node, EventTouch, Input, input, Vec2, Vec3, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {
    @property(Node)
    stick: Node = null;

    @property
    private radius: number = 100;
    @property
    private maxRadius = 100; // 最大滑动范围

    private _startPos: Vec3 = new Vec3();
    private _touchId: number = -1;
    private _direction: Vec2 = new Vec2(0, 0);

    protected onLoad() {
        
        // 记录初始位置
        this._startPos = this.stick.position.clone();
        
        // 注册触摸事件
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    protected onDestroy() {
        // 移除触摸事件
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    private _onTouchStart(event: EventTouch) {
        // 如果已经有触摸在进行，则忽略新的触摸
        if (this._touchId !== -1) return;

        const touchPos = event.getUILocation();
        const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
        const localPos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);

        // 检查触摸点是否在摇杆范围内
        if (localPos.length() <= this.radius * 2) {
            this._touchId = event.getID();
            this._updateStickPosition(localPos);
        }
    }

    private _onTouchMove(event: EventTouch) {
        if (event.getID() !== this._touchId) return;

        const touchPos = event.getUILocation();
        const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
        const localPos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);

        this._updateStickPosition(localPos);
    }

    private _onTouchEnd(event: EventTouch) {
        if (event.getID() !== this._touchId) return;

        this._touchId = -1;
        this._direction.set(Vec2.ZERO);
        this.stick.position = this._startPos.clone();
    }

    private _updateStickPosition(touchPos: Vec3) {
        // 计算触摸点相对于摇杆中心的向量
        const direction = new Vec2(touchPos.x, touchPos.y);
        const distance = direction.length();

        // 限制摇杆移动范围
        if (distance > this.maxRadius) {
            direction.normalize().multiplyScalar(this.maxRadius);
            this.stick.position = new Vec3(direction.x, direction.y, 0);
        } else {
            this.stick.position = touchPos;
        }

        // 计算并归一化方向向量
        if (distance > 0) {
            this._direction = direction.normalize();
        } else {
            this._direction.set(Vec2.ZERO);
        }
    }

    /**
     * 获取当前摇杆的方向向量
     * @returns 归一化的方向向量
     */
    public getDirection(): Vec2 {
        return this._direction.clone();
    }

    /**
     * 获取当前摇杆的移动强度(0-1)
     * @returns 移动强度
     */
    public getIntensity(): number {
        const distance = this.stick.position.clone().subtract(this._startPos).length();
        return Math.min(distance / this.maxRadius, 1);
    }
}
