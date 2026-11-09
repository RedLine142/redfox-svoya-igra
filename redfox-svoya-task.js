/* RED FOX — СВОЯ ИГРА | Task page skin
 * Standalone visual layer for individual Safari tasks.
 * Runs only on /play/safari/<task-id>; leaves the board and game logic untouched.
 */
(function (window, document) {
  'use strict';

  var path = window.location && window.location.pathname || '';
  if (!/^\/play\/safari\/\d+\/?$/i.test(path)) return;
  if (document.getElementById('rf-svoya-task-style')) return;

  var css = [
    ':root{--rfst-bg:#050b19;--rfst-panel:#0b1730;--rfst-blue:#17477f;--rfst-blue2:#0c2a52;--rfst-gold:#e7bd63;--rfst-gold2:#ffe6a3;--rfst-text:#f4f7ff;--rfst-muted:#9db0cf;}',
    'html{min-height:100%;background:var(--rfst-bg)!important;}',
    'body{min-height:100vh!important;overflow-x:hidden!important;color:var(--rfst-text)!important;background:radial-gradient(ellipse at 50% -10%,rgba(31,92,170,.34),transparent 48%),radial-gradient(ellipse at 5% 55%,rgba(17,59,121,.16),transparent 34%),linear-gradient(180deg,#0b1831 0%,#071124 48%,#030814 100%)!important;font-family:Arial,Roboto,sans-serif!important;}',
    'body:before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.13;background-image:linear-gradient(rgba(125,168,225,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(125,168,225,.055) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,#000,transparent 90%);}',
    'body>.wrapper{position:relative;z-index:1;min-height:100vh;padding-bottom:28px;box-sizing:border-box;}',
    '.fixed-top{position:sticky!important;top:0;z-index:50!important;padding:12px 15px!important;border-bottom:1px solid rgba(112,157,221,.22)!important;background:rgba(4,12,27,.94)!important;backdrop-filter:blur(14px);box-shadow:0 10px 28px rgba(0,0,0,.28)!important;}',
    '.fixed-top>.wrapper{width:min(1120px,100%)!important;margin:0 auto!important;}',
    '.enter{margin:0!important;}',
    '.non-fixed-input{display:flex!important;gap:10px!important;align-items:center!important;width:100%!important;}',
    '.non-fixed-input input[type=text]{flex:1 1 auto!important;min-width:0!important;height:46px!important;box-sizing:border-box!important;padding:0 16px!important;border:1px solid rgba(112,157,221,.38)!important;border-radius:8px!important;outline:none!important;color:#fff!important;background:linear-gradient(180deg,#101f39,#09162b)!important;box-shadow:inset 0 2px 8px rgba(0,0,0,.35)!important;font-size:15px!important;}',
    '.non-fixed-input input[type=text]::placeholder{color:#8297b9!important;}',
    '.non-fixed-input input[type=text]:focus{border-color:var(--rfst-gold)!important;box-shadow:0 0 0 3px rgba(231,189,99,.12),inset 0 2px 8px rgba(0,0,0,.3)!important;}',
    '.non-fixed-input button{height:46px!important;flex:0 0 auto!important;padding:0 24px!important;border:1px solid rgba(255,218,143,.78)!important;border-radius:8px!important;color:#fff1c8!important;background:linear-gradient(110deg,#78501b,#bd8b37 48%,#704816)!important;box-shadow:inset 0 1px rgba(255,255,255,.28),0 5px 14px rgba(0,0,0,.28)!important;font-weight:900!important;letter-spacing:.08em!important;text-transform:uppercase!important;cursor:pointer!important;transition:filter .2s,transform .2s!important;}',
    '.non-fixed-input button:hover{filter:brightness(1.13)!important;transform:translateY(-1px)!important;}',
    '.container.container-location{position:relative!important;box-sizing:border-box!important;width:min(1120px,calc(100% - 30px))!important;margin:26px auto 18px!important;padding:clamp(18px,3vw,34px)!important;border:1px solid rgba(112,157,221,.23)!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(15,35,69,.96),rgba(5,13,29,.97))!important;box-shadow:0 24px 70px rgba(0,0,0,.48),inset 0 1px rgba(255,255,255,.045),0 0 38px rgba(23,87,164,.10)!important;}',
    '.container-location .header{margin:0 0 16px!important;}',
    '.container-location .announcement{color:#dbe7fa!important;}',
    '.container-location h1{display:flex!important;align-items:center!important;gap:10px!important;margin:0 0 24px!important;padding:0 0 18px!important;border-bottom:1px solid rgba(112,157,221,.22)!important;color:#fff!important;font-size:clamp(20px,3vw,30px)!important;font-weight:900!important;line-height:1.25!important;}',
    '.container-location h1 a{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:38px!important;height:38px!important;flex:0 0 38px!important;border:1px solid rgba(231,189,99,.42)!important;border-radius:8px!important;color:var(--rfst-gold2)!important;background:linear-gradient(145deg,#183b67,#0c1d38)!important;box-shadow:inset 0 1px rgba(255,255,255,.1),0 4px 12px rgba(0,0,0,.25)!important;}',
    '.container-location h1 a:hover{filter:brightness(1.2)!important;}',
    '.container-location h1 .separator{color:rgba(231,189,99,.55)!important;}',
    '.container-location h1 strong{color:#fff!important;text-shadow:0 2px 16px rgba(88,157,255,.18);}',
    '.container-location .tabcontent{box-sizing:border-box!important;margin:0 0 14px!important;padding:clamp(17px,2.5vw,27px)!important;border:1px solid rgba(112,157,221,.2)!important;border-radius:11px!important;color:#eaf1ff!important;background:linear-gradient(145deg,rgba(12,29,55,.94),rgba(6,16,34,.97))!important;box-shadow:inset 0 1px rgba(255,255,255,.035),0 10px 28px rgba(0,0,0,.2)!important;}',
    '.container-location .tabcontent:not(.active){display:none!important;}',
    '.container-location .tabcontent.active{display:block!important;animation:rfst-panel-in .28s ease both;}',
    '@keyframes rfst-panel-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
    '.container-location .tabcontent p{margin:0 0 12px!important;color:#dce7f8!important;font-size:15px!important;line-height:1.65!important;}',
    '.container-location .tabcontent p:last-child{margin-bottom:0!important;}',
    '.container-location .tabcontent strong{color:var(--rfst-gold2)!important;font-weight:900!important;}',
    '.container-location .task_text{color:#f3f6ff!important;font-size:16px!important;line-height:1.75!important;}',
    '.container-location .hints{margin:0!important;padding:0!important;list-style:none!important;}',
    '.container-location .hints li{margin:0 0 12px!important;padding:15px 17px!important;border:1px solid rgba(112,157,221,.18)!important;border-left:3px solid rgba(231,189,99,.72)!important;border-radius:7px!important;background:rgba(7,20,40,.62)!important;}',
    '.container-location .hints li:last-child{margin-bottom:0!important;}',
    '.container-location .hints li p{margin:0!important;}',
    '.container-location .hints li p:first-child{margin-bottom:5px!important;color:var(--rfst-gold2)!important;font-size:13px!important;font-weight:900!important;letter-spacing:.06em!important;text-transform:uppercase!important;}',
    '.container-location .codes_class{color:#dce7f8!important;}',
    '.tabs{position:sticky!important;bottom:0!important;z-index:40!important;box-sizing:border-box!important;width:100%!important;margin:0!important;padding:10px 15px!important;border-top:1px solid rgba(112,157,221,.22)!important;background:rgba(4,12,27,.96)!important;backdrop-filter:blur(14px);box-shadow:0 -10px 28px rgba(0,0,0,.25)!important;}',
    '.tabs>.wrapper{display:flex!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important;width:min(1120px,100%)!important;margin:0 auto!important;}',
    '.tabs .tab{display:flex!important;align-items:center!important;justify-content:center!important;min-height:42px!important;box-sizing:border-box!important;padding:10px 17px!important;border:1px solid rgba(112,157,221,.25)!important;border-radius:7px!important;color:#a9bddc!important;background:linear-gradient(180deg,rgba(19,42,75,.92),rgba(8,22,44,.96))!important;font-size:11px!important;font-weight:900!important;letter-spacing:.08em!important;text-transform:uppercase!important;cursor:pointer!important;transition:all .2s ease!important;}',
    '.tabs .tab:hover{border-color:rgba(231,189,99,.55)!important;color:#fff!important;filter:brightness(1.12)!important;}',
    '.tabs .tab.active{border-color:rgba(255,218,143,.8)!important;color:#fff1c8!important;background:linear-gradient(110deg,#78501b,#a8792d 48%,#704816)!important;box-shadow:inset 0 1px rgba(255,255,255,.2),0 0 18px rgba(231,189,99,.13)!important;}',
    '@media(max-width:700px){.fixed-top{padding:9px 8px!important;}.non-fixed-input{gap:7px!important;}.non-fixed-input input[type=text]{height:43px!important;padding:0 11px!important;font-size:13px!important;}.non-fixed-input button{height:43px!important;padding:0 13px!important;font-size:10px!important;letter-spacing:.04em!important;}.container.container-location{width:calc(100% - 14px)!important;margin:12px auto!important;padding:14px 11px!important;border-radius:11px!important;}.container-location h1{gap:7px!important;margin-bottom:16px!important;padding-bottom:13px!important;font-size:19px!important;}.container-location h1 a{width:33px!important;height:33px!important;flex-basis:33px!important;}.container-location .tabcontent{padding:14px 12px!important;}.container-location .tabcontent p{font-size:14px!important;}.container-location .task_text{font-size:15px!important;}.tabs{padding:7px 6px!important;}.tabs>.wrapper{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important;}.tabs .tab{min-height:39px!important;padding:8px 5px!important;font-size:9px!important;letter-spacing:.035em!important;}}',
    '@media(prefers-reduced-motion:reduce){.container-location .tabcontent.active{animation:none!important;}.non-fixed-input button,.tabs .tab{transition:none!important;}}'
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'rf-svoya-task-style';
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  (document.head || document.documentElement).appendChild(style);

  document.documentElement.classList.add('rf-svoya-task-active');
  if (document.body) document.body.classList.add('rf-svoya-task-active');
  if (window.console && console.info) console.info('[RED FOX] «Своя игра»: оформление задания подключено.');
})(window, document);
