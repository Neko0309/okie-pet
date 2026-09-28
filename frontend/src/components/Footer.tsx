import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <div>
          <h4>Okie Pet</h4>
          <p>墨尔本本地宠物用品小店,专注猫狗的吃喝玩乐。</p>
        </div>
        <div>
          <h4>配送</h4>
          <p>
            全澳满 $169 包邮
            <br />
            墨尔本当日配送
          </p>
        </div>
        <div>
          <h4>联系我们</h4>
          <p>
            邮箱：hello@okiepet.com.au
            <br />
            营业时间：每天 10:00–19:00
          </p>
        </div>
      </div>
    </footer>
  );
}
