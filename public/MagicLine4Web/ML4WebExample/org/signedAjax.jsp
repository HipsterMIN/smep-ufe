<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="utf-8"%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>
<script type="text/javascript">

// 180711 : 원문 입력 -> 서명 데이터 확인 -> ajax 전송 -> 결과 확인 순서로 진행
var isResultShown = false;
var encMsg = "";
// 서명 진행
function doSignData(){
		
	var signData = $("#signData").val();
	if(signData.length < 1){
		alert('폼 데이터를 입력하세요.');
		$("#signData").focus();
		return;
	}
	
	magicline.uiapi.MakeSignData($("#signData").val(), null, mlCallBack);
	
}

// 서명 callback
function mlCallBack(code, message){
	if(code==0){
		encMsg = message.encMsg;
		ajaxSubmit();
		//signResultDrawler(message);
		
	}else{
		alert("결과값 수신에 실패하였습니다.");
		return;
	}
}

//서명 결과 데이터를 화면에 출력
function signResultDrawler(message){
	
	encMsg = message.encMsg;
	var htmlStream = "";
	
	if(typeof(message) === "undefiend"){
		alert('No message for signature. \nPlease make sure sign data');
		return;
	}
	
	for(var key in message){
		htmlStream += '<tr>';
		htmlStream += '	<td>' + key + '</td>';
		htmlStream += '	<td>' + message[key] + '</td>';
		htmlStream += '</tr>';
	}
	
	htmlStream += '<tr>';
	htmlStream += '	<td colspan="2" class="buttonRow" align="center">';
	htmlStream += '		<input type="button" class="button" value="전송" name="Submit" onClick="ajaxSubmit();">';
	htmlStream += ' </td>';
	htmlStream += '</tr>';
	
	$("#signatureResultArea").html(htmlStream);
	
	if(!isResultShown){			
		isResultShown=true;			
		$("#signatureResultDiv").css("display", "");
	}
	
}

// ajax 요청
function ajaxSubmit(){
	
	var data = encodeURIComponent(encMsg);
	$("#signedResultArea").html();
	$.ajax({
		url:'./signedAjaxR.jsp?sign='+ data,
		success:function(data){
			var rText = data.split("<MYTAG>");
			$("#signedResultArea").html(rText[1]);			
			$("#ajaxResultDiv").css("display", "");
			
			//$("#eText").val(rText[1]);
		}, error : function(data){
			$("#signedResultArea").html('<font color="red">Ajax Failed</font>');
		}
	});
	
}

</script>
<div id="middle">
	<h2>MagicLine Digital Signature</h2>
	<div id="workArea"><!-- DIV START  -->
	
	<!-- 페이지 설명 -->
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
		<tr>		
			<th colspan="2">Description</th>		
		</tr>
		</thead>
		<tr>
			<td>&nbsp;&nbsp;웹 구간 전달 메시지 전체에 대해 클라이언트에서 전자서명을 실행합니다.(비동기 통신)</td>
		</tr>
	</table>
	<p>&nbsp;</p>
	<form id='reqForm' name='reqForm' method='post' action="./signedR.jsp">
	
	<!-- 서명 입력 영역  -->
	<input type="hidden" id='sign' name='sign'/>
	<input type="hidden" id='sType' name='sType'/>
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
					<input type="button" class="button" value="전자서명" onclick="doSignData();">
				</td>
			</tr>
		</tbody>
	</table>
	<p>&nbsp;</p>
	
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
	
	<!-- 서버 통신 결과 출력 영역 -->
	<div id="ajaxResultDiv" style="display:none;">
		<table class="styledLeft" id="sgTable">
			<thead>
				<tr>
					<th colspan="2">Server Send Signed Data</th>
				</tr>
			</thead>
			<tbody>
				<tr bgcolor="white">
					<td>Signed Text</td>
					<td id="signedResultArea"></td>
				</tr>
			</tbody>
		</table>
	</div>
	
	</form>
	<p>&nbsp;</p>
	</div>
</div>
		
<jsp:include page="include/footer.jsp"></jsp:include>