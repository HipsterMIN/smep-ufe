<%@ page contentType="text/html;charset=UTF-8"%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>

<div>
<button onClick="ML_goBug();" style="width:300px;height:50px;">버그리포팅으로 이동</button><br/><br/><br/><br/>

<h3>[ 2016-07-18 10:30 ]</h3>
* Version : 클라이언트 : win = 1.0.1.0, mac = 1.0.1.0<br/>
1. [bugfix]<br/>
 - 보안토큰 인증서 복사 오류 수정<br/>

2. [기능추가]<br/>
 - 인증서 찾기 안드로이드 기기 추가<br/>
 - 인증서 필터링 기능 추가<br/>
 - cs update html 추가<br/>
 - libType(CRYPT)이 C 인 경우 CS 실행 기능 추가<br/>

3. [기능변경]<br/>
 - 관리메뉴 인증서 복사시 암호 체크 기능 적용<br/>

<br/><br/>

<h3>[ 2016-07-12 10:30 ]</h3>
* Version : 클라이언트 : win = 1.0.1.0, mac = 1.0.1.0<br/>
1. [bugfix]<br/>
 - 다이얼로그 z-index조정<br/>
 - alert 다이얼로그 포커스 처리<br/>

2. [기능추가]<br/>
 - pfx 모바일 인증 기능 추가<br/>
 - cs 설치 download type 및 모바일 기기 예외 처리 추가<br/>
 - 인증서 목록 필터 적용 개발중<br/>
 - js minify 버전 적용<br/>

3. [기능변경]<br/>
 - 사이트 Domain 변수화<br/>
 - 사이트 언어 ko로 픽스 적용<br/>
 - pfx import 창 탭이벤트 포커스 처리<br/>

<br/><br/>

<h3>[ 2016-07-07 10:30 ]</h3>
* Version : 클라이언트 : win = 1.0.1.0, mac = 1.0.1.0<br/>
1. [bugfix]<br/>
 - 인증서 재서명창 호출 오류 수정<br/>

2. [기능추가]<br/>
 - cs 설치 관련 기능 추가<br/>

3. [기능변경]<br/>
 - 로컬스토리지 인증서 백업 MLCert 사용여부를 config 옵션 처리.<br/>

<br/><br/>

<h3>[ 2016-07-05 10:30 ]</h3>
* Version : 클라이언트 : win = 1.0.1.0, mac = 1.0.1.0<br/>
1. [bugfix]<br/>
 - MLjquiWindow 다이얼로그 창 z-index 조정<br/>
 - 오류 메세지 표시 오류 버그 패치<br/>
 - ie8 디자인 패치 적용<br/>

2. [기능추가]<br/>
 - 스마트인증 연동 스크립트 추가<br/>
 - 초기화 시점 조절. 외부 Alert Dialog 기능 개발<br/>

3. [기능변경]<br/>
 - 초기화 완료 체크 로직 변경<br/>

<br/><br/>

<h3>[ 2016-07-04 10:30 ]</h3>
* Version : 클라이언트 : win = 1.0.1.0, mac = 1.0.1.0<br/>
1. [bugfix]<br/>
 - 클라이언트 종료시 메시지가 깨지는 현상 수정<br/>
 - IE8 적용 패치. 스크립트 오류 수정<br/>
 - 오류 코드 문구 추가 & 정리<br/>
 - localStorage DreamWebCert Sync 기능 개발로 인한 <br/>
   Side Effect. Storage Api DeleteCert, SaveCert 기능 버그패치<br/>

2. [기능추가]<br/>
 - CS Install popup open 모듈 추가<br/>
 - mlcert.dreamsecurity.com iframe 적용<br/>
 - localStorage DreamWebCert Sync 기능 개발<br/>

3. [기능변경]<br/>
 - 없음<br/>

<br/><br/>

<h3>[ 2016-06-30 10:30 ]</h3>
* Version : 클라이언트 : win = 1.0.0.31, mac = 1.0.1.0<br/>
1. [bugfix]<br/>
 - 공백삭제, 한글 메세지 처리, 콜백정리<br/>

2. [기능추가]<br/>
 - PFX 인증서 가져오기 웹스토리지 인증서 저장 여부 선택 기능 추가<br/>
 - Loading 완료 체크 변수 적용<br/>
 - mac용 cs 파일 추가<br/>
 
3. [기능변경]<br/>
 - design js plugin concat & minify<br/>

<br/><br/>

<h3>[ 2016-06-28 10:30 ]</h3>
* Version : 클라이언트 : win = 1.0.0.31<br/>
1. [bugfix]<br/>
 - 없음<br/>

2. [기능추가]<br/>
 - Loading 완료 체크 변수 적용<br/>
 - 멀티 OS 테스트 환경 적용<br/>

3. [기능변경]<br/>
 - 도메인 설정 방법 변경.(Config 으로 1원화)<br/>
 - 스마트 공인인증 Web 취소 메시지 처리 부분 삭제<br/>
 - SSL 공인인증서 적용 및 도메인 변경<br/>
 - SSL 공인인증서 포트 변경으로 인한 포트 체크 로직 수정<br/>
 - 테스트 코드 삭제<br/>

<br/><br/>

<h3>[ 2016-06-26 10:00 ]</h3>
* Version : 클라이언트 : win = 1.0.0.31<br/>
1. [bugfix]<br/>
 - ie8 지원을 위한 버그패치<br/>

2. [기능추가]<br/>
 - 버그리포팅 메뉴 추가<br/>
 - 스마트인증 모바일 추가<br/>
 - 스마트인증 Web 처리 모듈 추가<br/>
 - 클라이언트 업데이트 c crypto filepicker 기능 추가<br/>
 - C crypto 에서만 사용되는, PFX 파일 선택하기위한  getFilePicker() 함수 추가<br/>
 - input 창 enterKey 이벤트 처리 적용<br/>

3. [기능변경]<br/>
 - pfx savecert 함수 기능 패치 - realname 부재 인증서에 대한 처리<br/>
 - 메인다이얼로그창 Full Screen Iframe 적용<br/>

<br/><br/>

<h3>[ 2016-06-22 09:30 ]</h3>
* Version : 클라이언트 : win = 1.0.0.31<br/>
1. [bugfix]<br/>
 - cs 설치 문구 수정<br/>

2. [기능추가]<br/>
 - 인증서 가져오기 팝업 추가<br/>
 - 인증서 삭제 팝업 추가<br/>
 - 로컬서버 설치 모듈 추가<br/>
 - 로컬서버 인스톨 모듈 개발<br/>

3. [기능변경]<br/>
 - 패스워드 유효성 검사 수정<br/>
 - 패키징 구조 변경<br/>

<br/><br/>

<h3>[ 2016-06-21 09:30 ]</h3>
* Version : 클라이언트 : win = 1.0.0.31<br/>
 * 최초릴리즈 <br/>

<br/><br/><br/><br/><br/>

</div>
<!-- <script type="text/javascript" src="../js/MagicLine.js?v=20150803"></script> -->
<!-- DIV END  --> <script type="text/javascript">
	//window.open("./popup.html","MagicLine4NP", "width=500,height=400,resizable=no,toolbar=no,location=no,status=no" );
	/* setCookie('current-breadcrumb', 'magicline_v40_menu');
    document.onload=setBreadcrumDiv();
    function setBreadcrumDiv () {
        var breadcrumbDiv = document.getElementById('breadcrumb-div');
        breadcrumbDiv.innerHTML = '<table cellspacing="0"><tr><td class="breadcrumb-link"><a href="index.jsp">Home</a></td><td class="breadcrumb-link">&nbsp;>&nbsp;MagicLine4</td><td class="breadcrumb-link">&nbsp;>&nbsp;index</td>';
    }
    function goBug(){
		window.open("https://docs.google.com/forms/d/1l8z2g7Xuj6Zjts2of_liadXvRwXPyCws_HRxrcOG8Bc/viewform?c=0&w=1","","width=500,height=1000")
	}*/
</script><jsp:include page="include/footer.jsp"></jsp:include>