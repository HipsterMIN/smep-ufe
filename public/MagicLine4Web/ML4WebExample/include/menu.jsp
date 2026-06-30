<%@ page contentType="text/html;charset=UTF-8" pageEncoding="utf-8"%>
<table id="main-table" border="0" cellspacing="0">
	<tr>
		<td id="header" colspan="2">
		<div id="header-div">
		<div class="right-logo">MagicLine4Web Console</div>
		<div class="left-logo"><a href="index.jsp" class="header-home">
			<img src="./images/1px.gif" width="300px" height="32px" /></a>
		</div>
		<div class="middle-ad"></div>
		<div class="header-links">
			<div class="right-links">
			<ul>
				<li class="middle"><label id="logged-user"> <strong>Signed-in
				as:</strong>&nbsp;admin@ </label></li>
				<li class="middle">|</li>
				<li class="right"><a href="./document/MagicLine V4.0_Install_Guide.pdf">Install Docs </a></li>
				<li class="middle">|</li>
				<li class="right"><a href="./document/MagicLineV4.0_Function_Guide.pdf">Function Docs </a></li>
				<li class="middle">|</li>
				<li class="middle"><a target="_blank" href="./document/MagicLineServerV4.2/index.html">MagicLine Java Docs</a></li>
				<li class="middle">|</li>
				<li class="middle"><a target="_blank" href="./document/Jcaos_docs/index.html">Jcaos Java Docs</a></li>
				<li class="middle">|</li>
				<li class="left"><a target="_blank" href="http://www.dreamsecurity.com">About</a></li>
			</ul>
			</div>
		</div>
		</div>
		</td>
	</tr>
	<tr>
		<td id="menu-panel" valign="top">
		<table id="menu-table" style="border:0;border-spacing:0;">
			<tr>
				<td id="magicline">
					<div id="menu">
						<ul class="main">
							<li id="magicline_v40_menu" class="menu-header"
								onclick="mainMenuCollapse(this.childNodes[0])"
								style="cursor: pointer"><img src="./images/up-arrow.gif"
								class="mMenuHeaders" id="magicline_v40_menu" />[Samples]MagicLine4Web
							</li>
							 <!-- <li class="normal">
								<ul class="sub">
									<li class="menu-disabled-link" style="background-image: url(../mediation/images/mediation-icon.gif);">로그인</li>
									<li><a href="../ML4WebExample/login_renew.jsp" class="menu-default" style="background-image: url(../sequences/images/sequences.gif);">인증서 로그인</a></li>
								</ul>
							</li>
							<li class="menu-disabled-link" style="background-image: url(../mediation/images/mediation-icon.gif);">세션키 암호화 (로그인 후 사용)</li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/sessionEncrypt.jsp" class="menu-default" style="background-image: url(../sequences/images/sequences.gif);">세션키 클라이언트 암호화</a></li>
									<li><a href="../ML4WebExample/sessionEncryptKeyExchange.jsp" class="menu-default" style="background-image: url(../sequences/images/sequences.gif);">세션키 Exchange</a></li>
									<li><a href="../ML4WebExample/sessionSvrEncrypt.jsp" class="menu-default" style="background-image: url(../sequences/images/sequences.gif);">세션키 서버 암호화</a></li>
									<li><a href="../ML4WebExample/sessionEncryptKeyExchangeAjax.jsp" class="menu-default" style="background-image: url(../sequences/images/sequences.gif);">AJAX 암호화</a></li>
								</ul>
							</li> -->
							<li class="menu-disabled-link">전자서명</li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/signedForm.jsp" class="menu-default">Form 전자서명 </a></li>
									<li><a href="../ML4WebExample/ucpidRequestInfo.jsp" class="menu-default">UCPIDReqeuestInfo </a></li>
									<li><a href="../ML4WebExample/addSignedForm.jsp" class="menu-default">AddSign </a></li>
									<li><a href="../ML4WebExample/signedAjax.jsp" class="menu-default">Ajax 전자서명 </a></li>
									<li><a href="../ML4WebExample/signedFormXML_single.jsp" class="menu-default">Form XML 전자서명(단건)</a></li>
									<li><a href="../ML4WebExample/signedFormXML_multi.jsp" class="menu-default">Form XML 전자서명(다건)</a></li>
									
								<!-- 	<li><a href="../ML4WebExample/signEncrypt.jsp" class="menu-default" style="background-image: url(../endpoints/images/endpoints-icon.gif);">전자서명 & 암호화</a></li> -->
								</ul>
							</li>
							<li class="menu-disabled-link">본인확인 & 전자서명</li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/vidClientIDN.jsp" class="menu-default">서버에서 검증 - IDN 입력 </a></li>
									<!-- <li><a href="../ML4WebExample/vidServerIDN.jsp" class="menu-default">서버에서 검증 - 서버 IDN 이용  </a></li> -->
								</ul>
							</li>
							<li class="menu-disabled-link">구간 암복호화</li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/e2eForm.jsp" class="menu-default">Form 암호화 전송</a></li>
									<li><a href="../ML4WebExample/e2eAjax.jsp" class="menu-default">Ajax 암호화 전송 </a></li>
								</ul>
							</li>
							<!-- <li class="menu-disabled-link"><span id="wholeMgmt" style="cursor:pointer;" onClick="javscript:magicline.uiapi.getCertManager();">인증서 관리 </span></li>
							<li class="menu-disabled-link">인증서이동 클라이언트 </li>
							<li class="normal">
								<ul class="sub">
									<li><a href="javascript:CertMoveStart();" class="menu-default">인증서이동 클라이언트 실행</a></li>
								</ul>
							</li>
							<li class="menu-disabled-link">모바일 샘플 </li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebSample/login.jsp?pageID=list" class="menu-default">모바일 샘플 이동</a></li>
								</ul>
							</li> -->
							<!-- 
							<li class="menu-disabled-link">피노텍 </li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/finotek_test/signedFormAndSig.jsp" class="menu-default">sig data 생성 / 검증</a></li>
									<li><a href="../ML4WebExample/finotek_test/addSignFormAndSig.jsp" class="menu-default">다중전자서명 sigData</a></li>
									<li><a href="../ML4WebExample/finotek_test/multipleSignedFormAndSig.jsp" class="menu-default">pdf & sig 전자서명 </a></li>
									<li><a href="../ML4WebExample/finotek_test/e2eServerEncrypt.jsp" class="menu-default">e2e 서버 암호화</a></li>
									<li><a href="../ML4WebExample/finotek_test/vidCheck.jsp" class="menu-default">본인확인</a></li>
								</ul>
							</li>
							 -->
							<!-- <li class="menu-disabled-link">국세청 </li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/nts_api.jsp" class="menu-default">국세청 테스트페이지</a></li>
								</ul>
							</li> -->
							<!-- 
							<li class="menu-disabled-link">NP -> 4Web 전환 </li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/NPto4Web_example.jsp" class="menu-default">샘플페이지</a></li>
								</ul>
							</li>
							 -->
							<li class="menu-disabled-link">E2E 적용샘플 </li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/signedAjaxWithE2E.jsp" class="menu-default">Ajax 전자서명</a></li>
								</ul>
							</li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/signedFormWithE2E.jsp" class="menu-default">Form 전자서명</a></li>
								</ul>
							</li>
							<!-- <li class="menu-disabled-link" style="background-image: url(../mediation/images/mediation-icon.gif);">전자봉투</li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/envelope.jsp" class="menu-default" style="background-image: url(../endpoints/images/endpoints-icon.gif);">전자봉투 </a></li>
									<li><a href="../ML4WebExample/envelopeSigned.jsp" class="menu-default" style="background-image: url(../endpoints/images/endpoints-icon.gif);">전자봉투 & 전자서명</a></li>
								</ul>
							</li>
							<li class="menu-disabled-link" style="background-image: url(../mediation/images/mediation-icon.gif);">유틸리티</li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/URIEncode.jsp" class="menu-default" style="background-image: url(../endpoints/images/endpoints-icon.gif);">EncodeURI</a></li>
								</ul>
							</li> -->
							<li class="menu-disabled-link">인증서 저장 & 이동 </li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/saveCert.jsp" class="menu-default">인증서 저장 </a></li>
								</ul>
							</li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/certmove/login.jsp" class="menu-default">모바일 샘플 페이지 </a></li>
								</ul>
							</li>
							<li class="normal">
								<ul class="sub">
									<li><a href="#" class="menu-default">클라이언트 실행 </a></li>
								</ul>
							</li>
							<li class="menu-disabled-link">피노텍 </li>
							<li class="normal">
								<ul class="sub">
									<li><a href="../ML4WebExample/signedFormAndSig.jsp" class="menu-default">sig data 생성 / 검증</a></li>
									<li><a href="../ML4WebExample/addSignFormAndSigClient.jsp" class="menu-default">sigData 서명자 추가(Client)</a></li>
									<li><a href="../ML4WebExample/addSignFormAndSigServer.jsp" class="menu-default">sigData 서명자 추가(Server)</a></li>
								</ul>
							</li>
							
						</ul>
					</div>
				</td>
			</tr>
			<tr>
				<td><img src="./images/1px.gif" width="225px" height="1px" /></td>
			</tr>
		</table>
		</td>
		<td id="middle-content">
		<table id="content-table" style="border:0;border-spacing:0;">
			<tr>
				<td id="page-header-links">
				<table class="page-header-links-table" style="border-spacing:0;">
					<tr>
						<td class="breadcrumbs">
						<table class="breadcrumb-table" style="border-spacing:0;">
							<tr>
								<td>
								<div id="breadcrumb-div"></div>
								</td>
							</tr>

						</table>
						</td>

						<td class="page-header-help"><a href="./docs/userguide.html"
							target="_blank"></a></td>
					</tr>
				</table>
				</td>
			</tr>
			<tr>
				<td id="body"><img src="./images/1px.gif" width="735px" height="1px" />
