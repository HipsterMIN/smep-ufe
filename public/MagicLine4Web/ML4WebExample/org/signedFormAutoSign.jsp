<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="utf-8"%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>
<script type="text/javascript">

//18.07.10
//1. 서명 원문 추가해서 signedFormR 에 서명 원문 데이터 파라미터 추가 
//2. 서명 원문 내용 출력 추가

// TODO : 반영할땐 result 출력 없이 해야됨.
var isResultShown = false;

function openMgmt(){
	magicline.uiapi.getCertManager(function(code, jsonObj){
		if(code == 0){
			fn_log("[ MgmtDialog ]Callback Data :::::  === ");

		}else {
			fn_log("[ MakeEnvelopeData ] ERROR ::: errCode = " + jsonObj.errCode + " / errMsg = " +jsonObj.errMsg);
		}
	});
}

function doSignData(){
	var signData = $("#signData").val(); 
	if(signData.length < 1){
		alert('폼 데이터를 입력하세요.');
		$("#signData").focus();
		return;
	}
	
	document.reqForm.signOrigin.value = document.reqForm.signData.value;
	magicline.uiapi.MakeSignData(signData, null, mlCallBack);
}

function doXecureSignData(){
	var signData = $("#signData").val();
	
	if(signData.length < 1){
		alert('폼 데이터를 입력하세요.');
		$("#signData").focus();
		return;
	}
	document.reqForm.signOrigin.value = document.reqForm.signData.value;
	magicline.uiapi.MakeXecureSignData(signData, mlCallBack);
}

// 서명 결과 데이터를 화면에 출력해주고 전송 버튼을 노출시켜주는 함수
function signResultDrawler(message){
	
	var htmlStream = "";
	if(typeof(message) === "undefiend"){
		alert('No message for signature. \nPlease make sure sign data');
		return;
	}
	
	for(var key in message){
		if(typeof message[key] === "object"){
			htmlStream += '<tr>';			
			htmlStream += '	<td colspan="2"><b>' + key + '</b></td>';
			htmlStream += '</tr>';
			for(var inKey in message[key]){			
				htmlStream += "<tr>";
				htmlStream += '	<td>&nbsp;&nbsp;&nbsp;&nbsp;' + inKey + '</td>';	
				htmlStream += '	<td>' + message[key][inKey] + '</td>';
				htmlStream += "</tr>";
			}
		}else{
			htmlStream += '<tr>';			
			htmlStream += '	<td><b>' + key + '</b></td>';
			htmlStream += '	<td>' + message[key] + '</td>';
			htmlStream += '</tr>';
		}
	}
	
	htmlStream += '<tr>';
	htmlStream += '	<td colspan="2" class="buttonRow" align="center">';
	htmlStream += '		<input type="button" class="button" value="전송" name="Submit" onClick="this.form.submit();">';
	htmlStream += ' </td>';
	htmlStream += '</tr>';
	
	$("#signatureResultArea").html(htmlStream);
	
	if(!isResultShown){			
		isResultShown=true;			
		$("#signatureResultDiv").css("display", "");
	}
}

function mlCallBack(code, message) {
	if (code == 0 && message.sessionId) {
		<!-- [KICS] 재서명 처리 시 전송될 form -->
		document.sessionForm.sessionId.value = message.sessionId;
		document.sessionForm.submit();
		
	} else {
		alert("sessionId가 존재하지 않습니다.");
		return;
	}
}

function test1(){
    // 팝업 창을 열 URL
    var popupURL = "./sessionlessE2EAjax.html"; // 팝업에 표시할 웹 페이지 URL을 지정하세요.
    
    // 팝업 창의 속성
    var popupWidth = 600; // 팝업 창의 가로 너비 (픽셀)
    var popupHeight = 400; // 팝업 창의 세로 높이 (픽셀)
    var popupOptions = "width=" + popupWidth + ",height=" + popupHeight;

    // 팝업 창 열기
    window.open(popupURL, "MyPopup", popupOptions);
	
}

</script>
<div id="middle">
	<h2>MagicLine Digital Signature</h2>
	<div id="workArea"><!-- DIV START  -->
	
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
		<tr>		
			<th colspan="2">Description</th>		
		</tr>
		</thead>
		<tr>
			<td>&nbsp;&nbsp;웹 구간 전달 메시지 전체에 대해 클라이언트에서 전자서명을 실행합니다.</td>
		</tr>
	</table>
	
	<p>&nbsp;</p>
	<form id="sessionForm" name="sessionForm" method="post" action="signedFormRWithSession.jsp">
		<input type="hidden" id='sessionId' name='sessionId' />
	</form>
	<form id='reqForm' name='reqForm' method='post' action="./signedFormR.jsp">
	<!-- 결과 수신 메시지  -->
	<input type="hidden" id="signOrigin" name="signOrigin" /> <!-- 180701 서명 원문 폼 추가 -->
	<input type="hidden" id='sign' name='sign'/>
	<input type="hidden" id='encert' name='encert' />
	<input type="hidden" id='enpri' name='enpri' />
	<input type="hidden" id='enkmcert' name='enkmcert' />
	<input type="hidden" id='enkmpri' name='enkmpri' />	
	<input type="hidden" id='csCheckType' name='csCheckType' value="1"/>

	<!-- 전자서명 데이터 입력 영역 -->
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
			<tr>
				<th colspan="2">Client Digital Signature Information</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="formRow">
					<table class="normal" cellspacing="0" style="text-align: left;">
						<tr>
							<td>전자서명 원문 데이터 입력<font class="required">*</font></td>
							<td>
								<textarea id="signData" name="signData" rows="3" cols="60"></textarea>
								<!-- <input class="text-box-big" id="signData" name="signData" type="text" value="">-->
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<td colspan="2" class="buttonRow" align="center">
					<input id="aaa" type="button" class="button" value="전자서명" onclick="doSignData();">
					<input id="bbb" type="button" class="button" value="팝업띄우기" onclick="test1();">
					<!-- <input name="Submit" type="button" class="button" value="XECURE 전자서명" onclick="doXecureSignData();"/> -->
			</tr>
		</tbody>
	</table>
	
	<!-- 전자서명 데이터 출력 영역 -->
	<div id="signatureResultDiv" style="display:none;" >
	<table style="width: 100%; height:100%"  class="styledLeft" >
		<thead>
			<tr>
				<th colspan="2">Signature Data Information</th>
			</tr>
		</thead>
		<tbody id="signatureResultArea">
		</tbody>
	</table>
	</div>
	</form>
	<p>&nbsp;</p>
	</div>
</div><!-- DIV END  -->
<div id="selectCertContainer1" style="width:100%;margin-top:0; display:none;"></div>
<div id="startCs" style="width:100%;margin-top:0; display:none;"></div>


<jsp:include page="include/footer.jsp"></jsp:include>